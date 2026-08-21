// OpenWeatherMap Geocoding 결과의 국가 코드를 화면에서 사용할 정보로 변환한다.
const continentCountryCodes = {
  아시아: `AF AM AZ BH BD BT BN KH CN GE HK IN ID IR IQ IL JP JO KZ KW KG LA LB MO MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE`,
  유럽: `AL AD AT AX BY BE BA BG HR CY CZ DK EE FO FI FR DE GI GR GG VA HU IS IE IM IT JE LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB XK`,
  아프리카: `DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW`,
  북아메리카: `AI AG AW BS BB BZ BM BQ CA KY CR CU CW DM DO SV GL GD GP GT HT HN JM MQ MX MS NI PA PR BL KN LC MF PM VC SX TT TC US VG VI`,
  남아메리카: `AR BO BR CL CO EC FK GF GY PY PE GS SR UY VE`,
  오세아니아: `AS AU CC CK CX FJ PF GU KI MH FM NR NC NZ NU NF MP PW PG PN WS SB TK TO TV UM VU WF`,
}

const continentByCountryCode = Object.entries(continentCountryCodes).reduce((result, [continent, codes]) => {
  codes.split(' ').forEach((code) => {
    result[code] = continent
  })
  return result
}, {})

const countryNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['ko'], { type: 'region' })
  : null

export const getContinentByCountryCode = (countryCode) => {
  return continentByCountryCode[countryCode?.toUpperCase()] || '기타'
}

export const getCountryName = (countryCode) => {
  if (!countryCode) return ''

  try {
    return countryNames?.of(countryCode.toUpperCase()) || countryCode
  } catch {
    return countryCode
  }
}
