import { ModelsInterface } from "./ModelsInterface";
import * as Sequelize from "sequelize";

export interface BaseModelInterface {

    // o ? indica que o atribute eh opcional
    prototype?;
    // serve para associar um model com outro
    // associate?;
}