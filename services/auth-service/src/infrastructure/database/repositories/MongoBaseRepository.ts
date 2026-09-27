import { Document,Model } from "mongoose";

/** mongo base repository */

export abstract class MongoBaseRepository<TDomain,TDocument extends Document>{
    protected readonly model:Model<TDocument>;

    constructor(model:Model<TDocument>){
        this.model = model;
    }

    protected abstract map(document:TDocument):TDomain;
    
    async findById(id:string):Promise<TDomain|null>{
        const doc = await this.model.findById(id);
        return doc ? this.map(doc) : null
    };

    async findAll():Promise<TDomain[]>{
        const docs = await this.model.find();
        return docs.map((doc) => this.map(doc))
    }

    async deleteById(id:string):Promise<void> {
        await this.model.findByIdAndDelete(id)
    }
    
}


