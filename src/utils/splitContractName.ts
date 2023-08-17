/**
 * Splits the contract name into an array of strings based on the delimiters '/' or '-'.
 * If no delimiter is found, returns an array with the original name.
 * @param name - The contract name to be split.
 * @returns An array of strings after splitting the contract name.
 */
export const splitContractName = (name: string): Array<string> => {
  // Define the delimiters to split the contract name
  const splitDelimiters = ['/', '-', '_']

  // Find the delimiter present in the contract name
  const delimiter = splitDelimiters.find((item) => name.includes(item))

  // Split the contract name using the delimiter if found, otherwise return an array with the original name
  return delimiter ? name.split(delimiter) : [name]
}
