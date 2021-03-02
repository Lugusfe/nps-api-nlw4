import { EntityRepository, Repository } from "typeorm";
import { Survey } from "../models/Survey";

@EntityRepository(Survey)
class SurveysRespository extends Repository<Survey>{}

export { SurveysRespository }