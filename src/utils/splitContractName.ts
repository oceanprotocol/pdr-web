/**
 * Splits the contract name into an array of strings based on the delimiters '/' or '-'.
 * If no delimiter is found, returns an array with the original name.
 * @param name - The contract name to be split.
 * @returns An array of strings after splitting the contract name.
 * @example
 * splitContractName('ETH-USDC') // ['ETH', 'USDC']
 */
export const splitContractName = (name: string): Array<string> => {
  // Define the delimiters to split the contract name
  const splitDelimiters = ['/', '-', '_']

  // Find the delimiter present in the contract name
  const delimiter = splitDelimiters.find((item) => name.includes(item))

  // Split the contract name using the delimiter if found, otherwise return an array with the original name
  return delimiter ? name.split(delimiter) : [name]
}

/**
 * Compares two arrays of strings and returns true if they are equal.
 * @param name1 - The first array of strings to be compared.
 * @param name2 - The second array of strings to be compared.
 * @returns A boolean indicating whether the two arrays are equal.
 * @example
 * compareSplittedNames(['Ocean', 'Token'], ['Ocean', 'Token']) // true
 */
export const compareSplittedNames = (
  name1: Array<string>,
  name2: Array<string>
): boolean => {
  // Return false if the length of the arrays is different
  if (name1.length !== name2.length) return false

  // Compare each element of the arrays
  for (let i = 0; i < name1.length; i++) {
    // If the elements are different, return false
    if (name1[i] !== name2[i]) return false
  }

  // Return true if all elements are equal
  return true
}
