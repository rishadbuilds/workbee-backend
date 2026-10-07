// escape user input before using it inside a regex
/**
So don't say "confusing Regex syntax to common". A more natural/simple explanation is:
"It converts Regex special characters into normal/literal characters."
*/


export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");