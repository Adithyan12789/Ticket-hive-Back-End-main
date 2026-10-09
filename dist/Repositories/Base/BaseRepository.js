"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        console.log('Base repository created');
        return await this.model.create(data);
    }
    async findOneById(id) {
        console.log('Base repository findById');
        return await this.model.findById(id).exec();
    }
    async findAllData() {
        console.log('Base repository findAll');
        return await this.model.find().exec();
    }
    async updateOneById(id, data) {
        console.log('Base repository Update');
        return await this.model.findByIdAndUpdate(id, { $set: data }, { new: true });
    }
    async deleteOneById(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return result !== null;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map