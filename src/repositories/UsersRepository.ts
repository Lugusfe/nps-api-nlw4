import { EntityRepository, Repository } from "typeorm";
import { User } from "../models/User";

@EntityRepository(User)
class UsersRespository extends Repository<User>{}

export { UsersRespository }