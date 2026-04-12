import { CategoryRepository } from '../repositories/categories/category.repository';
import { CreateCategory } from '../use-cases/category/create-category';
import { ListCategories } from '../use-cases/category/list-categories';
import { GetCategory } from '../use-cases/category/get-category';
import { UpdateCategory } from '../use-cases/category/update-category';
import { DeleteCategory } from '../use-cases/category/delete-category';
import { CreateCategoryController } from '../controllers/category/create-category.controller';
import { ListCategoriesController } from '../controllers/category/list-categories.controller';
import { GetCategoryController } from '../controllers/category/get-category.controller';
import { UpdateCategoryController } from '../controllers/category/update-category.controller';
import { DeleteCategoryController } from '../controllers/category/delete-category.controller';

export function makeCategoryControllers() {
    const repository = new CategoryRepository();

    return {
        create: new CreateCategoryController(new CreateCategory(repository)),
        list: new ListCategoriesController(new ListCategories(repository)),
        getById: new GetCategoryController(new GetCategory(repository)),
        update: new UpdateCategoryController(new UpdateCategory(repository)),
        delete: new DeleteCategoryController(new DeleteCategory(repository)),
    };
}
