import {TextInput as PrimerTextInput, themeGet} from '@primer/components'
import styled from 'styled-components'

const TextInput = styled(PrimerTextInput)`
  /* The font-size of inputs should never be less than 16px.
   * Otherwise, iOS browsers will zoom in when the input is focused.
   * TODO: Update font-size of TextInput in @primer/components.
   */
  font-size: ${themeGet('fontSizes.2')} !important;
`
export default TextInput