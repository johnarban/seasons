// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */


// Originally `AARISETRANSITSET.CPP`
// "Purpose: Implementation for the algorithms which obtain the Rise, Transit and Set times"
// Last update of original: PJN / 15-10-2004
// Updated to include correction for RA wrap-around PJN / 28-03-2009 & PJN / 74-04-2017
// Updated to include fix for not porperly constraining M PJN / 30-04-2009
// Update to include wrapping of H values in the transit calculation. 
//
// Translated into C# and released by Microsoft, then transpiled into JavaScript
// by ScriptSharp, for the WorldWide Telescope project.
//
// The legal notices in the original code are as follows:
//
// Copyright (c) 2003 - 2007 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)
//
// All rights reserved.
//
// Copyright / Usage Details:
//
// You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise)
// when your product is released in binary form. You are allowed to modify the source code in any way you want
// except you cannot modify the copyright details at the top of each module. If you want to distribute source
// code with your application, then you are only allowed to distribute versions released by the author. This is
// to maintain a single distribution point for the source code.


import { CT, DYT, INTP, CAASidereal } from "@wwtelescope/engine";


// CAARiseTransitSetFixedDetails

export function CAARiseTransitSetFixedDetails() {
  this.bValid = false;
  this.rise = 0;
  this.transit = 0;
  this.set = 0;
  this.bValid = false;
  this.rise = 0;
  this.transit = 0;
  this.set = 0;
}




// CAARiseTransitSetFixed

export function CAARiseTransitSetFixed() { }

CAARiseTransitSetFixed.constraintM = function (M) {
  while (M > 1) {
    M -= 1;
  }
  while (M < 0) {
    M += 1;
  }
  return M;
};

CAARiseTransitSetFixed.correctRAValuesForInterpolation = function (Alpha1, Alpha2, Alpha3) {
  // Itnroduced with v1.79
  Alpha1 = CT.m24(Alpha1);
  Alpha2 = CT.m24(Alpha2);
  Alpha3 = CT.m24(Alpha3);
  if (Math.abs(Alpha2 - Alpha1) > 12.0) {
    if (Alpha2 > Alpha1)
      Alpha1 += 24;
    else
      Alpha2 += 24;
  }
  if (Math.abs(Alpha3 - Alpha2) > 12.0) {
    if (Alpha3 > Alpha2)
      Alpha2 += 24;
    else
      Alpha3 += 24;
  }
  if (Math.abs(Alpha2 - Alpha1) > 12.0) {
    if (Alpha2 > Alpha1)
      Alpha1 += 24;
    else
      Alpha2 += 24;
  }
  if (Math.abs(Alpha3 - Alpha2) > 12.0) {
    if (Alpha3 > Alpha2)
      Alpha2 += 24;
    else
      Alpha3 += 24;
  }
  return [Alpha1, Alpha2, Alpha3];
};

CAARiseTransitSetFixed.rise = function (JD, Alpha1, Delta1, Alpha2, Delta2, Alpha3, Delta3, Longitude, Latitude, h0) {
  var details = new CAARiseTransitSetFixedDetails();
  details.bValid = false;
  var theta0 = CAASidereal.apparentGreenwichSiderealTime(JD);
  theta0 *= 15;
  var deltaT = DYT.deltaT(JD);
  var Delta2Rad = CT.d2R(Delta2);
  var LatitudeRad = CT.d2R(Latitude);
  var h0Rad = CT.d2R(h0);
  var cosH0 = (Math.sin(h0Rad) - Math.sin(LatitudeRad) * Math.sin(Delta2Rad)) / (Math.cos(LatitudeRad) * Math.cos(Delta2Rad));
  if ((cosH0 > 1) || (cosH0 < -1)) {
    return details;
  }
  var H0 = Math.acos(cosH0);
  H0 = CT.r2D(H0);
  var M0 = (Alpha2 * 15 + Longitude - theta0) / 360;
  M0 = CAARiseTransitSetFixed.constraintM(M0);
  var M1 = M0 - H0 / 360;
  var M2 = M0 + H0 / 360;
  M1 = CAARiseTransitSetFixed.constraintM(M1);
  M2 = CAARiseTransitSetFixed.constraintM(M2);

  var og = [Alpha1, Alpha2, Alpha3];
  [Alpha1, Alpha2, Alpha3] = CAARiseTransitSetFixed.correctRAValuesForInterpolation(Alpha1, Alpha2, Alpha3);
  if (og[0] !== Alpha1 || og[1] !== Alpha2 || og[2] !== Alpha3) {
    console.error('Corrected RA values for interpolation in rise/set calculation');
  }
  for (var i = 0; i < 2; i++) {
    // find rise
    var theta1 = theta0 + 360.985647 * M1;
    theta1 = CT.m360(theta1);
    var n = M1 + deltaT / 86400;
    var Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
    var Delta = INTP.interpolate(n, Delta1, Delta2, Delta3);
    var H = theta1 - Longitude - Alpha * 15;
    var Horizontal = CT.eq2H(H / 15, Delta, Latitude);
    var DeltaM = (Horizontal.y - h0) / (360 * Math.cos(CT.d2R(Delta)) * Math.cos(LatitudeRad) * Math.sin(CT.d2R(H)));
    M1 += DeltaM;
    // find transit
    theta1 = theta0 + 360.985647 * M0;
    theta1 = CT.m360(theta1);
    n = M0 + deltaT / 86400;
    Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
    H = theta1 - Longitude - Alpha * 15;
    H = CT.m360(H);
    if (H > 180) {
      H -= 360;
    }
    DeltaM = -H / 360;
    M0 += DeltaM;
    // find set
    theta1 = theta0 + 360.985647 * M2;
    theta1 = CT.m360(theta1);
    n = M2 + deltaT / 86400;
    Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
    Delta = INTP.interpolate(n, Delta1, Delta2, Delta3);
    H = theta1 - Longitude - Alpha * 15;
    Horizontal = CT.eq2H(H / 15, Delta, Latitude);
    DeltaM = (Horizontal.y - h0) / (360 * Math.cos(CT.d2R(Delta)) * Math.cos(LatitudeRad) * Math.sin(CT.d2R(H)));
    M2 += DeltaM;
  }
  details.bValid = true;
  details.rise = M1 * 24;
  details.set = M2 * 24;
  details.transit = M0 * 24;
  return details;
};

