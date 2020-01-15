const request = require('request');
const { readFileSync } = require('fs');
const { Agent } = require('https');
var uuidV4 = require('uuid/v4');
const {
  getImageDict,
  getReceivedMessage,
  getReplyMessage,
  getLocation
} = require('./abcMeta')

const getApplePay = (applePayWidget) => {
  let {
    images, payment, receivedMessage, requestIdentifier
  } = applePayWidget;

  let applePayTile = []
  let businessChatMessage = {
    "type": "BusinessChatMessage"
  }
  let imagesDict = getImageDict(images);
  if(receivedMessage) {
    let {
      title, subTitle,
      style, imageIdentifier
    } = receivedMessage;
    let rMsg = {};
    if(title) { rMsg['title'] = title };
    rMsg['subtitle'] = title;

    if(imageIdentifier) {
      if(style) { rMsg['style'] = style };
      rMsg['imageURL'] = imagesDict[imageIdentifier];
    };
    businessChatMessage['receivedMessage'] = rMsg;
  }
  applePayTile.push(businessChatMessage);
  let applePaymentReq = _getBusinessPayMessage(applePayWidget);
  applePayTile.push(applePaymentReq);
  // console.log('applePayTile:', applePayTile);
  let content = {"type":"vertical","tag":"payment","elements":[{"type":"text","text":"Apple Pay Request"}]}
  return {
    'content' : content,
    'meta' : applePayTile
  };;
}

const _getBusinessPayMessage = (applePayWidget) => {
  let {
    paymentRequest, endpoints,merchantSession
  } = applePayWidget['payment'];
  let {
    lineItems, merchantName, shippingMethods, total, applePay, countryCode,
    currencyCode, requiredBillingContactFields,
    requiredShippingContactFields
  } = paymentRequest;

  let totalAmount = 0;
  let purchaseItems = []
  for(var i = 0; i < lineItems.length; i++) {
    if(lineItems[i]['amount']) {
        lineItems[i]['type'] = 'final';
        purchaseItems.push(Object.assign({}, lineItems[i]));
    }
  }
  if(!total) {
    total = {}
  }
  total['type'] = 'pending';
  total['label'] = merchantName;
  // let filteredShippingMethod = shippingMethods.filter((v) => )
  // console.log('got here...', filteredShippingMethod);
  return {
    "type": "ConnectorPaymentRequest",
    'apple': {
      'data': {
        'version' : '1.0',
        'payment' : {
          "paymentRequest": {
            "applePay": {
              "merchantIdentifier": applePay['merchantIdentifier'],
              "merchantCapabilities": applePay['merchantCapabilities'],
              "supportedNetworks": applePay['supportedNetworks']
            },
            "lineItems": purchaseItems,
            "total": total,
            "countryCode": countryCode,
            "currencyCode": currencyCode,
            "supportedCountries": [
              "US"
            ],
            "shippingMethods": [],
            "requiredBillingContactFields": requiredBillingContactFields,
            "requiredShippingContactFields": requiredShippingContactFields
          },
          "endpoints": endpoints,
          "merchantSession": merchantSession
        },
        'requestIdentifier' : uuidV4()
      }
    }
  }
}

const sampleData = [
  {
    "type": "BusinessChatMessage",
    "receivedMessage": {
      "style": "large",
      "subtitle": "Buy now for $100",
      "title": "Complete your order",
      "imageURL": "https://example.com/image.png"
    }
  },
  {
    "type": "ConnectorPaymentRequest",
    "apple": {
      "data": {
        "version": "1.0",
        "payment": {
          "paymentRequest": {
            "applePay": {
              "merchantIdentifier": "merchant.com.aramarkchat",
              "merchantCapabilities": [
                "supports3DS",
                "supportsCredit",
                "supportsDebit"
              ],
              "supportedNetworks": [
                "amex",
                "visa",
                "mastercard"
              ]
            },
            "lineItems": [
              {
                "label": "Beer",
                "amount": "5",
                "type": "final"
              },
              {
                "label": "Hot dog",
                "amount": "10",
                "type": "final"
              }
            ],
            "total": {
              "label": "Tamara Mellon",
              "amount": "15",
              "type": "pending"
            },
            "countryCode": "US",
            "currencyCode": "USD",
            "supportedCountries": [
              "US",
              "UA"
            ],
            "requiredBillingContactFields": [
              "post"
            ],
            "requiredShippingContactFields": [
              "email",
              "post"
            ],
            "shippingMethods": []
          },
          "endpoints": {
            "paymentGatewayUrl": "https://aramark-test-server.mocstage.com/paymentGateway",
            "fallbackUrl": "https://aramark-test-server.mocstage.com/paymentGateway"
          },
          "merchantSession": {
            "epochTimestamp": 1549051526727,
            "expiresAt": 1549058726727,
            "merchantSessionIdentifier": "PSH3A1DFA0751424A00A2C6C4FC7890B668_C23A0D3024FAB8B12CBB67660B4C1B48ABF1272EC8B61399E3A647290C8BE67A",
            "nonce": "19d32483",
            "merchantIdentifier": "BE38E1F207F951263E1B5A070351A234E53800A34B393D9AFC80ECF7E8647913",
            "displayName": "merchant.com.aramarkchat",
            "signature": "308006092a864886f70d010702a0803080020101310f300d06096086480165030402010500308006092a864886f70d0107010000a080308203e230820388a00302010202082443f2a8069df577300a06082a8648ce3d040302307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b3009060355040613025553301e170d3134303932353232303631315a170d3139303932343232303631315a305f3125302306035504030c1c6563632d736d702d62726f6b65722d7369676e5f5543342d50524f4431143012060355040b0c0b694f532053797374656d7331133011060355040a0c0a4170706c6520496e632e310b30090603550406130255533059301306072a8648ce3d020106082a8648ce3d03010703420004c21577edebd6c7b2218f68dd7090a1218dc7b0bd6f2c283d846095d94af4a5411b83420ed811f3407e83331f1c54c3f7eb3220d6bad5d4eff49289893e7c0f13a38202113082020d304506082b0601050507010104393037303506082b060105050730018629687474703a2f2f6f6373702e6170706c652e636f6d2f6f63737030342d6170706c6561696361333031301d0603551d0e041604149457db6fd57481868989762f7e578507e79b5824300c0603551d130101ff04023000301f0603551d2304183016801423f249c44f93e4ef27e6c4f6286c3fa2bbfd2e4b3082011d0603551d2004820114308201103082010c06092a864886f7636405013081fe3081c306082b060105050702023081b60c81b352656c69616e6365206f6e207468697320636572746966696361746520627920616e7920706172747920617373756d657320616363657074616e6365206f6620746865207468656e206170706c696361626c65207374616e64617264207465726d7320616e6420636f6e646974696f6e73206f66207573652c20636572746966696361746520706f6c69637920616e642063657274696669636174696f6e2070726163746963652073746174656d656e74732e303606082b06010505070201162a687474703a2f2f7777772e6170706c652e636f6d2f6365727469666963617465617574686f726974792f30340603551d1f042d302b3029a027a0258623687474703a2f2f63726c2e6170706c652e636f6d2f6170706c6561696361332e63726c300e0603551d0f0101ff040403020780300f06092a864886f76364061d04020500300a06082a8648ce3d04030203480030450220728a9f0f92a32ab999742bd55eb67340572a9687a1d62ef5359710f5163e96e902210091379c7d6ebe5b9974af40037f34c23ead98b5b4b7f70d355c86b2a81372f1b1308202ee30820275a0030201020208496d2fbf3a98da97300a06082a8648ce3d0403023067311b301906035504030c124170706c6520526f6f74204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b3009060355040613025553301e170d3134303530363233343633305a170d3239303530363233343633305a307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b30090603550406130255533059301306072a8648ce3d020106082a8648ce3d03010703420004f017118419d76485d51a5e25810776e880a2efde7bae4de08dfc4b93e13356d5665b35ae22d097760d224e7bba08fd7617ce88cb76bb6670bec8e82984ff5445a381f73081f4304606082b06010505070101043a3038303606082b06010505073001862a687474703a2f2f6f6373702e6170706c652e636f6d2f6f63737030342d6170706c65726f6f7463616733301d0603551d0e0416041423f249c44f93e4ef27e6c4f6286c3fa2bbfd2e4b300f0603551d130101ff040530030101ff301f0603551d23041830168014bbb0dea15833889aa48a99debebdebafdacb24ab30370603551d1f0430302e302ca02aa0288626687474703a2f2f63726c2e6170706c652e636f6d2f6170706c65726f6f74636167332e63726c300e0603551d0f0101ff0404030201063010060a2a864886f7636406020e04020500300a06082a8648ce3d040302036700306402303acf7283511699b186fb35c356ca62bff417edd90f754da28ebef19c815e42b789f898f79b599f98d5410d8f9de9c2fe0230322dd54421b0a305776c5df3383b9067fd177c2c216d964fc6726982126f54f87a7d1b99cb9b0989216106990f09921d00003182018d30820189020101308186307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b300906035504061302555302082443f2a8069df577300d06096086480165030402010500a08195301806092a864886f70d010903310b06092a864886f70d010701301c06092a864886f70d010905310f170d3139303230313230303532365a302a06092a864886f70d010934311d301b300d06096086480165030402010500a10a06082a8648ce3d040302302f06092a864886f70d01090431220420279cf9714ff43bfd017c9f87514e16ab6db54f9f9dccb950765032c7a2268daa300a06082a8648ce3d0403020448304602210080fe26fb896428a3350baa11458067e5b5059aa9d98ecd0750819ffc81c13f1d022100d34e179091a926440c13487f3615d533d4eee169842629399d51db3122f16188000000000000",
            "initiative": "messaging",
            "initiativeContext": "https://aramark-test-server.mocstage.com/paymentGateway",
            "signedFields": [
              "merchantIdentifier",
              "merchantSessionIdentifier",
              "initiative",
              "initiativeContext",
              "displayName",
              "nonce"
            ]
          }
        },
        "requestIdentifier": "cfd8d346-ea8d-4efd-8bfb-129b7b837344"
      }
    }
  }
]


module.exports = {
  getApplePay
}
