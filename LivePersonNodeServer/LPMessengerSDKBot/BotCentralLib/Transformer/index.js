module.exports = {
  fb : {
    ...require('./fb_button'),
    ...require('./fb_list'),
    ...require('./fb_carousel'),
    ...require('./fb_generic'),
    ...require('./fb_qr'),
  },
  abc : {
    ...require('./abc_applepay'),
    ...require('./abc_listpicker'),
    ...require('./abc_timepicker'),
    ...require('./abc_richlink')
  },
  grbm : {
    ...require('./grbm'),
    ...require('./grbm_qr'),
    ...require('./grbm_card'),
    ...require('./grbm_button'),
    ...require('./grbm_carousel'),
    ...require('./grbm_image')
  },
  common : {
    ...require('./button'),
    ...require('./carousel'),
    ...require('./image'),
    ...require('./text'),
    ...require('./luis'),
    ...require('./structuredtile'),
    ...require('./quick_reply')
  }
}
