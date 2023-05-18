import { IsArray, IsBoolean, IsNumber, IsObject, IsString } from "class-validator";

export class Parameters {
    @IsNumber()
    year: number

    @IsString()
    duration: number

    @IsString()
    country: string
}

export class CreateMovieDto {
    @IsString()
    poster: string

    @IsString()
    bigPoster: string

    @IsString()
    title: string

    @IsString()
    description: string

    @IsString()
    slug: string

    @IsObject()
    parameters?: Parameters

    @IsString()
    videoUrl: string

    @IsString()
    subtitles: string

    @IsArray()
    @IsString({each: true})
    genres: string[]

    @IsArray()
    @IsString({each: true})
    actors: string[]

    isSendTelegram?: boolean
}