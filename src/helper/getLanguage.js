import { en } from '~languages/en'
import { vi } from '~languages/vi'
export const getLanguage = locate => {
  let result = ''
  switch (locate) {
    case 'VI':
      result = vi
      break
    case 'EN':
      result = en
      break

    default:
      result = vi
      break
  }

  return result
}
