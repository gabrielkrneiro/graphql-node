import { BaseModelInterface } from "../interfaces/BaseModelInterface";
import * as Sequelize from 'sequelize';
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { ModelsInterface } from "../interfaces/ModelsInterface";

export interface UserAttributes {

    id?: number;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {

    isPassword(encodedPassword: string, password: string): boolean;
}

export interface UserModel extends BaseModelInterface, Sequelize.Model<UserInstance, UserAttributes> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) => {

    const User = 
        sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                notEmpty: true // nao permite string vazia
            }
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: true,
            defaultValue: null
        }
    }, { // opcoes de definicao dos nossos models
        tableName: "user",
        hooks: { // triggers
            beforeCreate: (user: UserInstance, options: Sequelize.CreateOptions) => {

                const salt = genSaltSync();
                user.password = hashSync(user.password, salt);
            },

            /**
             *  se nao estiver sendo alterado a senha do usuario, nao eh necessario
             *  fazer uma criptografia da senha. Sendo assim , evita-se criptografar
             *  a senha ja criptografada
             */
            beforeUpdate: (user: UserInstance, options: Sequelize.CreateOptions) => {

                if (user.changed('password')) {

                    const salt = genSaltSync();
                    user.password = hashSync(user.password, salt);
                }
            } 
        }
    });

    function isPassword (encodedPassword: string, password: string): boolean  {

        return compareSync(password, encodedPassword);
    }

    // associacoes
    // User.associate = (models: ModelsInterface): void => {}

    return User;
}