// Referral name normalization utility
// Maps various spellings and misspellings to the correct referral names

export const VALID_REFERRALS = [
  'Reshab',
  'Darshan', 
  'Kavya',
  'Rohit',
  'Supreeth',
  'Direct',
  'NA'
] as const;

export type ValidReferral = typeof VALID_REFERRALS[number];

// Mapping of common misspellings and variations to correct names
const REFERRAL_ALIASES: Record<string, ValidReferral> = {
  // Reshab variations
  'reshab': 'Reshab',
  'rishab': 'Reshab', 
  'rishabh': 'Reshab',
  'reshav': 'Reshab',
  'reshaab': 'Reshab',

  // Darshan variations
  'darshan': 'Darshan',
  'darshaan': 'Darshan',
  'darsan': 'Darshan',
  'darshn': 'Darshan',

  // Kavya variations
  'kavya': 'Kavya',
  'kaviya': 'Kavya',
  'kavyaa': 'Kavya',
  'kavay': 'Kavya',

  // Rohit variations
  'rohit': 'Rohit',
  'rohitt': 'Rohit',
  'roheet': 'Rohit',
  'roheat': 'Rohit',

  // Supreeth variations
  'supreeth': 'Supreeth',
  'supreet': 'Supreeth',
  'suprith': 'Supreeth',
  'suprath': 'Supreeth',
  'supreethh': 'Supreeth',

  // Direct variations
  'direct': 'Direct',
  'DIRECT': 'Direct',
  'website': 'Direct',
  'google': 'Direct',
  'search': 'Direct',
  'organic': 'Direct',

  // NA variations
  'na': 'NA',
  'n/a': 'NA',
  'none': 'NA',
  'null': 'NA',
  'unknown': 'NA',
  '': 'NA',
};

/**
 * Normalizes a referral name to one of the valid referral names
 * @param referralName - The raw referral name from the database
 * @returns The normalized referral name
 */
export function normalizeReferralName(referralName: string | null | undefined): ValidReferral {
  if (!referralName) {
    return 'NA';
  }

  const trimmed = referralName.trim();
  
  // Check exact match first (case sensitive)
  if (VALID_REFERRALS.includes(trimmed as ValidReferral)) {
    return trimmed as ValidReferral;
  }

  // Check aliases (case insensitive)
  const lowercase = trimmed.toLowerCase();
  if (REFERRAL_ALIASES[lowercase]) {
    return REFERRAL_ALIASES[lowercase];
  }

  // Try partial matching for common patterns
  for (const [alias, correct] of Object.entries(REFERRAL_ALIASES)) {
    if (lowercase.includes(alias) || alias.includes(lowercase)) {
      return correct;
    }
  }

  // Default to NA if no match found
  return 'NA';
}

/**
 * Gets all unique normalized referral names from a list of raw referral names
 * @param referralNames - Array of raw referral names
 * @returns Array of unique normalized referral names
 */
export function getNormalizedReferrals(referralNames: (string | null | undefined)[]): ValidReferral[] {
  const normalized = referralNames.map(normalizeReferralName);
  return Array.from(new Set(normalized));
}