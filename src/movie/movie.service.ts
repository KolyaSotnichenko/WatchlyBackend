import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieModel } from './movie.model';

@Injectable()
export class MovieService {
    constructor(@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
    private readonly telegramService: TelegramService){}

    async bySlug(slug: string){
        const doc = await this.MovieModel.findOne({slug}).populate('actors genres').exec()

        if(!doc) throw new NotFoundException('Movie not found!')

        return doc
    }

    async byActor(actorId: Types.ObjectId){
        const docs = await this.MovieModel.find({actors: actorId}).exec()

        if(!docs) throw new NotFoundException('Movies not found!')

        return docs
    }

    async byGenres(genreIds: Types.ObjectId[]){
        const docs = await this.MovieModel.find({genres: {$in: genreIds}}).exec()

        if(!docs) throw new NotFoundException('Movies not found!')

        return docs
    }

    async getAll(searchTerm?: string){
        let options = {}

        if(searchTerm){
            options = {
                $or: [
                    {
                        "title": new RegExp(searchTerm, 'i')
                    }
                ]
            }
        }

        return this.MovieModel.find(options).select('-updatedAt -__v').sort({
            createdAt: 'desc'
        }).populate('actors genres').exec()
        
    }

    async updateCountOpened(slug: string) {
        const updateDoc = await this.MovieModel.findOneAndUpdate({slug}, {
            $inc: {countOpened: 1}
        }, {new: true}).exec()

        if(!updateDoc) throw new NotFoundException('Movie not found!')

        return updateDoc
    }

    async getMostPopular(){
        return this.MovieModel.find({countOpened: {$gt: 0}}).sort({countOpened: -1}).populate('genres').exec()
    }

    async updateRating(id: Types.ObjectId, newRating: number){
        return this.MovieModel.findByIdAndUpdate(id, {
            rating: newRating
        }, {
            new: true
        }).exec()
    }

    /* Admin place */

    async byId(_id: string){

        const movie = await this.MovieModel.findById(_id)
        if(!movie) throw new NotFoundException('Actor not found!')

        return movie
    }

    async create(){
        const defaultValue:CreateMovieDto = {
            actors: [],
            bigPoster: '',
            genres: [],
            description: '',
            poster: '',
            title: '',
            slug: '',
            videoUrl: '',
            subtitles: ''
        }

        const movie = await this.MovieModel.create(defaultValue)
        return movie._id
    }

    async update(_id: string, dto: CreateMovieDto) {

        if(!dto.isSendTelegram){
            await this.sendNotification(dto)
            dto.isSendTelegram = true
        }

        const updateDoc = await this.MovieModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec()

        if(!updateDoc) throw new NotFoundException('Movie not found!')

        return updateDoc
    }

    async delete(id: string){
        const deleteDoc = await this.MovieModel.findByIdAndDelete(id).exec()

        if(!deleteDoc) throw new NotFoundException('Movie not found!')

        return deleteDoc
    }

    async sendNotification(dto: CreateMovieDto){
        if(process.env.NODE_ENV !== 'development')
            await this.telegramService.sendPhoto(`https://watchlybackend-production.up.railway.app${dto.poster}`)

        const msg = `<b>${dto.title}</b>\n\n`

        await this.telegramService.sendMessage(msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            url: `https://watchly-front-end.vercel.app/movie/${dto.slug}`,
                            text: 'Go to watch!'
                        }
                    ]
                ]
            }
        })
    }
}
