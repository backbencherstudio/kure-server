import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    // console.log(searchTerm);
    // console.log(searchableFields);
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (filed) =>
            ({
              [filed]: { $regex: searchTerm, $options: 'i' },
            }) as unknown as FilterQuery<T>[],
        ),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy query
    const excluedeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excluedeFields.forEach((el) => delete queryObj[el]); // exat match করবে এমন filed রাখা হয়েছে(email)
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  // filter() {
  //   const queryObj = { ...this.query }; // copy query
  //   const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  //   excludeFields.forEach((el) => delete queryObj[el]); // remove exact match fields

  //   // Handle price range filtering
  //   if (queryObj.minPrice && queryObj.maxPrice) {
  //     queryObj.price = {
  //       $gte: parseInt(queryObj.minPrice),
  //       $lte: parseInt(queryObj.maxPrice),
  //     };
  //   }

  //   this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
  //   return this;
  // }

  // sort(sortt) {
  //   // const sort =
  //   //   (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
  //   console.log(sortt);
  //   const assenDessenSort = sortt === 'ascending' ? -1 : 1;

  //   this.modelQuery = this.modelQuery.sort(assenDessenSort);
  //   return this;
  // }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
}

export default QueryBuilder;
