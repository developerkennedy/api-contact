import {CategoryDTO, CreateCategoryDto} from "../../../domain/category.entity";

export interface ICategoryRepository {
    create(data:CreateCategoryDto):Promise<CategoryDTO>
    findById(id:string):Promise<CategoryDTO>
    delete(id:string):Promise<CategoryDTO>
    update(id:string):Promise<CategoryDTO>
}