import { Color, RenderContext, RiseSetDetails } from "@wwtelescope/engine";


declare module "@wwtelescope/engine" {

  export class WebFile {
    constructor(url: string);
  }

  export class AstroCalc {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static getPlanet(jd: number, planet: number, latitudeRad: number, longitudeRad: number, height: number): { RA: number; dec: number };
    // 0. Planet: alt = -0.5667, 1. sun alt = -0.8333, 2.  alt = 0.125 // these account for refraction
    static getRiseTransitSet(jd: number, lat: number, lng: number, ra1: number, dec1: number, ra2: number, dec2: number, ra3: number, dec3: number, type: 0 | 1 | 2): RiseSetDetails;
  }

  export class GlyphCache {
    constructor(glyphHeight: number);
    _texture: Texture;
    _webFile: WebFile;

    static getCache(height: number): GlyphCache;
  }

  export class Grids {
    static drawAltAzGrid(renderContext: RenderContext, opacity: number, drawColor: Color): void;
    static drawEcliptic(renderContext: RenderContext, opacity: number, drawColor: Color): void;
    static _makeAltAzGridText(): void;
    static _altAzTextBatch: Text3dBatch | null;
  }

  export class Text3dBatch {
    constructor(height: number);
    items: Text3d[];
    _glyphCache: GlyphCache;

    prepareBatch(): void;
  }

  export class Text3d {
    constructor(center: boolean, up: boolean, text: string, fontsize: number, scale: number);
  }

  export class Vector3d {
    static create(x: number, y: number, z: number): Vector3d;
  }

  export class Texture {
    static fromUrl(url: string): Texture;
  }

  export class PushPin {
    static getPushPinTexture(pinId: number): Texture;
  }

  export class Tile {
    static tilesInView: number;
    static tilesTouched: number;
    static deepestLevel: number;
  }

  export class RenderTriangle {}

  export class Planets {
    static _planetTextures: Texture[];
    static _planetScales: number[];

    // Technically this is a list of AstroRaDec objects, but this is a good enough definition
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _planetLocations: { RA: number; dec: number }[];

    static drawPlanets(renderContext: RenderContext, opacity: number): void;
    static updatePlanetLocations(threeD: boolean): void;
    static _loadPlanetTextures(): void;
  }

}
