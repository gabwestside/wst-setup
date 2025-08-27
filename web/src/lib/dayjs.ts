import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/pt-br'
dayjsOrig.locale('pt-br')
dayjsOrig.extend(utc)

export const dayjs = dayjsOrig