import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveyUser } from '../models/SurveyUser';
import { AppError } from "../errors/AppError";
import { resolve } from 'path';
import { SurveysRespository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRespository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';

class SendMailController{

    async execute(request: Request, response: Response){
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRespository);
        const surveysRepository = getCustomRepository(SurveysRespository);
        const surveysUserRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});

        if(!user){
            throw new AppError("User does not exists")
        }

        const survey = await surveysRepository.findOne({id: survey_id})

        if(!survey){
            throw new AppError("Survey does not exists")
        }


        const npsPath = resolve(__dirname, "..","views","emails", "npsMail.hbs")


        const surveyUserAlreadyExists = await surveysUserRepository.findOne({
            where: { user_id: user.id, value: null, survey_id: survey_id },
            relations: ["user", "survey"],
          });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        }

        if(surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id
            await SendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUserAlreadyExists)
        }

        //salvar informações na tabela
        const surveyUser = surveysUserRepository.create({
            user_id: user.id,
            survey_id
        })
        await surveysUserRepository.save(surveyUser)

        
        variables.id = surveyUser.id
        
        await SendMailService.execute(email, survey.title, variables, npsPath)
        
        return response.json(surveyUser)
    }

}

export { SendMailController }