// A new file created for this type because when we use it from utils, we have to import all the utils,
// which is not ready yet and it causes an error. So, we create a new file for this type and use it from there
// TODO: Create sepeate files for all the types which are created in the utils.ts file in utils/types

/**
 * @description This enum is used to define the time interval for the prediction contract
 */
export enum EPredictoorContractInterval {
  e_5M = '5m',
  e_1H = '1h'
}
