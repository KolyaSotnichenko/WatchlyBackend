import { prop, Ref } from "@typegoose/typegoose"
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { ActorModel } from "src/actor/actor.model"
import { GenreModel } from "src/genre/genre.model"

export interface MovieModel extends Base {}

export class Parameters {
    @prop()
    year: number

    @prop()
    duration: number

    @prop()
    country: string
}

export class MovieModel extends TimeStamps {
    @prop()
    poster: string

    @prop()
    bigPoster: string

    @prop()
    title: string

    @prop()
    description: string

    @prop({unique: true})
    slug: string

    @prop()
    parameters?: Parameters

    @prop({default: 0.0})
    rating?: number

    @prop({default: 0})
    countOpened?: number

    @prop()
    videoUrl: string

    @prop()
    subtitles: string

    @prop({ref: () => GenreModel})
    genres: Ref<GenreModel>[]

    @prop({ref: () => ActorModel})
    actors: Ref<ActorModel>[]

    @prop({default: false})
    isSendTelegram?: boolean
}