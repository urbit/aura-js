import {
  formatDa,
  parseDa,
  formatUw,
  parseUw,
  formatUv,
  parseUv,
  parseUd,
  formatUd,
  parseUx,
  formatUx,
} from '../src';

const DA_PAIRS: [string, bigint][] = [
  [
    '~2022.5.2..15.50.20..b4cb',
    BigInt('170141184505617087925707667943685357568'),
  ],
  [
    '~2022.5.2..18.52.34..8166.240c.0635.b423',
    BigInt('170141184505617289618704043249403016227'),
  ],
];
describe('@da', () => {
  DA_PAIRS.map(([da, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseDa(da);
        const diff = integer - res;
        expect(diff == 0n).toBe(true);
      });
      it('formats', () => {
        const res = formatDa(integer);
        expect(res).toEqual(da);
      });
    });
  });
});

const UD_PAIRS: [string, bigint][] = [
  ['123', 123n],
  ['7.827.527.286', 7827527286n],
  [
    '927.570.172.527.456.683.282.759.587.841.913.712.910.138.850.310.449.267.827.527.286',
    BigInt('927570172527456683282759587841913712910138850310449267827527286'),
  ],
];

describe('@ud', () => {
  UD_PAIRS.map(([ud, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseUd(ud);
        const diff = integer - res;
        expect(diff === 0n).toBe(true);
      });
      it('formats', () => {
        const res = formatUd(integer);
        expect(res).toEqual(ud);
      });
    });
  });
});

const UW_PAIRS: [string, bigint][] = [
  ['0wji', 1234n],
  [
    '0w2.VNFPq.zLWXr.mHG98.cOSaU.jD-HK.WOAEW.icKX-.-UOti.RrLxM.BEdKI.U8j~T.rgqLe.HuVVm.m5aDi.FcUj0.z-9H9.PWYVS',
    BigInt(
      '9729869760580312915057700420931106632029212932045019789366559593013069886734510969807231346927570172527456683282759587841913712910138850310449267827527286'
    ),
  ],
  [
    '0w8.~wwXK.5Jbvq.EPFfs.mWqAa.G6VLL.Hp5RZ.1ztU0.OdjK6.rwC4f.IUflm.bew2G.q2V58.Yvb-y.8D7JP.mAX5-.tTUnZ.4PIzy.fU8eX.xriTS.GcWjT.5KCF2.GxKrX.WShtv.goTu0.czkXx.CU9x3.Xe3Rl.yPE0G.CwKhi.f7O~E.y9NXs.RFeNv.Dt-5~.hcX8U.z-23K.UmQJZ.GzeAZ.NrFGg.GErC-.-JAnn.Q6dTw.38ReU.pK2og.-PwZl.oIW0a.FEbAk.zNYLW.8ysuT.dqjIn.VTvxv.QjeOe',
    BigInt(
      '338660688809191135992117047766620650717811482934943979674885003948246397791915632356127816874957444994283298782534439422236465196123969501940528462017413072176474702992911473379692926314882846435461316330442229390384286920909868601208813714735355172837223931275587957994082972971545840145432819726749971121524031459169847685770572005049993814978529576884322644499161452167351136603982630270130940863597682766057587354154988711969349941809951888309135835193470094'
    ),
  ],
];
describe('@uw', () => {
  UW_PAIRS.map(([uw, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseUw(uw);
        const diff = integer - res;
        expect(diff === 0n).toBe(true);
      });
      it('formats', () => {
        const res = formatUw(integer);
        expect(res).toEqual(uw);
      });
    });
  });
});

const UV_PAIRS: [string, bigint][] = [
  ['0v16i', 1234n],
  [
    '0v1d0.l2h7n.mo1ro.s3r8e.4f6gd.dfsp1.hc5en.a0k8j.1v7vk.16jqd.oog39.5ool7.mrkdp.vvofi.gd2d6.vnmi9.a1dlt.7lbbm.iq76k.u5ivc.pp8qa',
    BigInt(
      '4715838753694475992579249794985609354876653107513376869107585916141874120351297535898666953377988719385257642282348313095587079274499396365843215360500554'
    ),
  ],
  [
    '0v1q7.2j1o2.gsrac.v0lr2.4qq3l.dl4dl.geimi.ti4kn.nerpk.io8e9.fb6u8.qdo3a.f6jnl.4t0ro.mnphj.45eu3.aasog.tgnop.mgknj.vrf7c.qh8uk.uhoko.e0k76.qj7o5.eoh6m.gtbd9.3dc3k.lknch.55trm.ud4m2.3ibqp.ni6je.0qjpk.tt978.6u5lu.ccp1b.ngqin.647c5.u6dk5.5svur.pr6ka.7l7ke.563g5.1pmkp.u1bm4.9lk7a.ra8rb.0t5d5.r499f.etnj9.5ggsi.umdsh.krg6k.ud7fa.9q1nh.dfj36.8ats6.klph1.r1fhj.d19f7.vmuep.l2ht9',
    BigInt(
      '2192679466494434890472543084060582766548642415978526232232529756549132081077716901494847003622252677433111645469887112954835308752404322485369993198040597565692723588585723772692969275396046341198068016409658069930178326315327541379152850899800598824712189194725563892210423915200062671509436137248472305920263160462934628062386175666117414052493363024883656571948762124184585291750029792031534226654202512820124560651712985859227347538529179923696933418921183145'
    ),
  ],
];
describe('@uv', () => {
  UV_PAIRS.map(([uv, integer], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseUv(uv);
        const diff = integer - res;
        expect(diff === 0n).toBe(true);
      });
      it('formats', () => {
        const res = formatUv(integer);
        expect(res).toEqual(uv);
      });
    });
  });
});

const UX_PAIRS: [string, string][] = [
  ['0x0', '0'],
  ['0xff.a0e2', 'ffa0e2'],
];

describe('@ux', () => {
  UX_PAIRS.map(([ux, hex], idx) => {
    describe(`case ${idx}`, () => {
      it('parses', () => {
        const res = parseUx(ux);
        expect(res).toEqual(hex);
      });
      it('formats', () => {
        const res = formatUx(hex);
        expect(res).toEqual(ux);
      });
    });
  });

  it('trims leading zeroes', () => {
    const res = formatUx('00ffa0e2');
    expect(res).toEqual('0xff.a0e2');
  });
});
