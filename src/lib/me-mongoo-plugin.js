const utils = require("../helpers/util-funcs");

const enhancements = {};
const defaultPluginOptions = {
  uniquePaths: [],
  pathsToLeanOut: ["__v"],
  virtualsNotToLeanOut: [],
};

enhancements.attachDeleteOneByProperty = (schema, _) => {
  schema.static("deleteOneByProperty", async function (key, value) {
    const docIdAsVirtualAliasName = "id";
    if (
      key === docIdAsVirtualAliasName &&
      !this.schema.path(docIdAsVirtualAliasName)
    ) {
      key = "_id";
    }

    const docToBeDeleted = await this.findOne().where(key).equals(value);
    if (!docToBeDeleted) return null;
    docToBeDeleted.deletionInfo = await this.deleteOne({
      _id: docToBeDeleted.id,
    });

    return docToBeDeleted;
  });
};

enhancements.attachFindDocWithUniquePaths = (schema, pluginOptions) => {
  schema.static("findDocWithUniquePaths", async function (docToCompare) {
    const docsInDb = await this.find();
    const queryResult = { doc: undefined, paths: [] };
    for (let docInDb of docsInDb) {
      for (let path of pluginOptions.uniquePaths) {
        let pathValueToCompare = docToCompare[path];
        const pathValueToCompareSchema = schema.obj[path];

        if (pathValueToCompare && pathValueToCompareSchema?.lowercase) {
          pathValueToCompare = pathValueToCompare.toLowerCase();
        }

        if (pathValueToCompare && pathValueToCompareSchema?.uppercase) {
          pathValueToCompare = pathValueToCompare.toUpperCase();
        }

        if (docInDb[path] === pathValueToCompare) {
          queryResult.doc = docInDb;
          queryResult.paths.push(path);
        }
      }
    }

    return queryResult.doc ? queryResult : {};
  });
};

enhancements.provideUniquePaths = (schema, pluginOptions) => {
  schema.virtual("uinquePaths").get(function () {
    return pluginOptions.uniquePaths;
  });
};

enhancements.provideLeanDoc = (schema, pluginOptions) => {
  schema.virtual("leanDoc").get(function () {
    const pathsToPick = ["_id"]
      .concat(Object.keys(this.schema.obj))
      .filter((key) => !pluginOptions.pathsToLeanOut.includes(key));

    const virtualsToPick = Object.keys(this.schema.virtuals).filter((key) =>
      pluginOptions.virtualsNotToLeanOut.includes(key)
    );

    const keysToPick = [...pathsToPick, ...virtualsToPick];
    return utils.pickProperties(keysToPick, this);
  });
};

const updateDefaultPluginOptions = (schema, options) => {
  defaultPluginOptions.uniquePaths = Object.keys(schema.obj).reduce(
    (uniquePaths, path) => {
      if (schema.obj[path].unique) uniquePaths.push(path);
      return uniquePaths;
    },
    ["id", "_id"]
  );
};

module.exports = (schema, requestedPluginOptions = {}) => {
  updateDefaultPluginOptions(schema, requestedPluginOptions);
  const pluginOptions = { ...defaultPluginOptions, ...requestedPluginOptions };

  enhancements.attachDeleteOneByProperty(schema, pluginOptions);
  enhancements.attachFindDocWithUniquePaths(schema, pluginOptions);
  enhancements.provideLeanDoc(schema, pluginOptions);
  enhancements.provideUniquePaths(schema, pluginOptions);
};
