type LeafType = "base" | "clara" | "oscura" | "curvada" | "enrollada" | "torsion";

function Leaf({ size = 1, type = "base" }: { size?: number; type?: LeafType }) {
  const w = Math.round(64 * size);
  const h = Math.round(64 * size);

  return (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {type === "base" && (
        <>
          <path d="M32 4 C 52 18 52 46 32 61 C 12 46 12 18 32 4 Z" fill="#5BA82E" />
          <path d="M32 4 C 52 18 52 46 32 61 L 32 4 Z" fill="#82C43E" />
          <path d="M32 7 L 32 58" stroke="#37761C" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M32 18 L 41 14 M32 28 L 43 25 M32 38 L 42 37 M32 18 L 23 14 M32 28 L 21 25 M32 38 L 22 37" stroke="#37761C" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        </>
      )}
      {type === "clara" && (
        <>
          <path d="M32 4 C 52 18 52 46 32 61 C 12 46 12 18 32 4 Z" fill="#7BC23A" />
          <path d="M32 4 C 52 18 52 46 32 61 L 32 4 Z" fill="#9DD45A" />
          <path d="M32 7 L 32 58" stroke="#4E8C24" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M32 18 L 41 14 M32 28 L 43 25 M32 38 L 42 37 M32 18 L 23 14 M32 28 L 21 25 M32 38 L 22 37" stroke="#4E8C24" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        </>
      )}
      {type === "oscura" && (
        <>
          <path d="M32 4 C 52 18 52 46 32 61 C 12 46 12 18 32 4 Z" fill="#469E22" />
          <path d="M32 4 C 52 18 52 46 32 61 L 32 4 Z" fill="#6FBE34" />
          <path d="M32 7 L 32 58" stroke="#2E6417" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M32 18 L 41 14 M32 28 L 43 25 M32 38 L 42 37 M32 18 L 23 14 M32 28 L 21 25 M32 38 L 22 37" stroke="#2E6417" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        </>
      )}
      {type === "curvada" && (
        <>
          <path d="M40 5 C 57 22 53 48 28 60 C 30 44 23 21 40 5 Z" fill="#5BA82E" />
          <path d="M40 5 C 57 22 53 48 28 60 L 40 5 Z" fill="#82C43E" />
          <path d="M39 9 C 48 25 45 47 29 57" stroke="#37761C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )}
      {type === "enrollada" && (
        <>
          <path d="M30 18 C 47 28 49 49 32 61 C 16 49 15 30 30 18 Z" fill="#5BA82E" />
          <path d="M30 18 C 47 28 49 49 32 61 L 30 18 Z" fill="#74BC35" />
          <path d="M30 18 C 25 9 38 3 44 11 C 41 17 35 19 30 18 Z" fill="#9DD45A" />
          <path d="M31 21 C 39 31 39 48 32 57" stroke="#37761C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}
      {type === "torsion" && (
        <>
          <path d="M41 6 C 55 14 51 31 37 35 C 30 29 31 13 41 6 Z" fill="#5BA82E" />
          <path d="M37 35 C 49 40 47 57 27 61 C 17 53 23 39 37 35 Z" fill="#74BC35" />
          <path d="M37 35 C 31 33 28 30 30 26 C 33 31 39 34 44 35 C 40 38 38 41 38 45 C 36 41 41 36 37 35 Z" fill="#9DD45A" />
          <path d="M41 9 C 50 16 46 30 37 35 C 28 40 25 53 28 58" stroke="#37761C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}

interface LeafDef {
  side: "left" | "right";
  top: string;
  offset: string;
  rotate: number;
  size: number;
  type: LeafType;
}

// 3 tamaños
const S = 0.45;
const M = 0.62;
const L = 0.85;

// Distribución: 2 columnas en la mayoría de tramos, 3 en algunos
// col A = pegada al borde (0-8px)
// col B = segunda fila   (32-44px)
// col C = tercera fila   (64-76px) — solo en algunos tramos
const LEAVES: LeafDef[] = [
  // ── IZQUIERDA ──────────────────────────────────────────────────────────
  // tramo 0-12% — 2 columnas
  { side: "left", top: "1%",  offset: "4px",  rotate: -30, size: M, type: "base"     },
  { side: "left", top: "5%",  offset: "36px", rotate: 55,  size: S, type: "curvada"  },

  // tramo 12-25% — 3 columnas
  { side: "left", top: "13%", offset: "2px",  rotate: -65, size: L, type: "clara"    },
  { side: "left", top: "17%", offset: "40px", rotate: 30,  size: S, type: "oscura"   },
  { side: "left", top: "21%", offset: "68px", rotate: -20, size: M, type: "enrollada"},

  // tramo 25-38% — 2 columnas
  { side: "left", top: "26%", offset: "6px",  rotate: 70,  size: S, type: "torsion"  },
  { side: "left", top: "31%", offset: "38px", rotate: -50, size: M, type: "base"     },

  // tramo 38-52% — 3 columnas
  { side: "left", top: "39%", offset: "0px",  rotate: -25, size: M, type: "oscura"   },
  { side: "left", top: "43%", offset: "42px", rotate: 60,  size: L, type: "curvada"  },
  { side: "left", top: "48%", offset: "72px", rotate: -45, size: S, type: "clara"    },

  // tramo 52-65% — 2 columnas
  { side: "left", top: "53%", offset: "8px",  rotate: 40,  size: S, type: "enrollada"},
  { side: "left", top: "58%", offset: "34px", rotate: -70, size: M, type: "base"     },

  // tramo 65-78% — 3 columnas
  { side: "left", top: "66%", offset: "2px",  rotate: -15, size: L, type: "torsion"  },
  { side: "left", top: "71%", offset: "44px", rotate: 55,  size: S, type: "oscura"   },
  { side: "left", top: "75%", offset: "70px", rotate: -35, size: M, type: "clara"    },

  // tramo 78-100% — 2 columnas
  { side: "left", top: "80%", offset: "6px",  rotate: 65,  size: M, type: "curvada"  },
  { side: "left", top: "85%", offset: "36px", rotate: -55, size: S, type: "base"     },
  { side: "left", top: "91%", offset: "4px",  rotate: 20,  size: L, type: "clara"    },
  { side: "left", top: "96%", offset: "40px", rotate: -40, size: S, type: "oscura"   },

  // ── DERECHA ────────────────────────────────────────────────────────────
  // tramo 0-13% — 2 columnas
  { side: "right", top: "2%",  offset: "6px",  rotate: 35,  size: S, type: "oscura"   },
  { side: "right", top: "7%",  offset: "38px", rotate: -60, size: M, type: "curvada"  },

  // tramo 13-27% — 3 columnas
  { side: "right", top: "14%", offset: "0px",  rotate: 65,  size: M, type: "enrollada"},
  { side: "right", top: "18%", offset: "42px", rotate: -30, size: L, type: "base"     },
  { side: "right", top: "23%", offset: "70px", rotate: 50,  size: S, type: "torsion"  },

  // tramo 27-40% — 2 columnas
  { side: "right", top: "28%", offset: "8px",  rotate: -50, size: S, type: "clara"    },
  { side: "right", top: "34%", offset: "36px", rotate: 25,  size: M, type: "oscura"   },

  // tramo 40-55% — 3 columnas
  { side: "right", top: "41%", offset: "2px",  rotate: -75, size: L, type: "curvada"  },
  { side: "right", top: "46%", offset: "40px", rotate: 45,  size: S, type: "base"     },
  { side: "right", top: "50%", offset: "68px", rotate: -20, size: M, type: "enrollada"},

  // tramo 55-68% — 2 columnas
  { side: "right", top: "56%", offset: "6px",  rotate: 60,  size: M, type: "clara"    },
  { side: "right", top: "62%", offset: "34px", rotate: -45, size: S, type: "torsion"  },

  // tramo 68-82% — 3 columnas
  { side: "right", top: "69%", offset: "4px",  rotate: -20, size: S, type: "oscura"   },
  { side: "right", top: "74%", offset: "44px", rotate: 70,  size: L, type: "base"     },
  { side: "right", top: "78%", offset: "72px", rotate: -55, size: M, type: "curvada"  },

  // tramo 82-100% — 2 columnas
  { side: "right", top: "83%", offset: "2px",  rotate: 30,  size: M, type: "clara"    },
  { side: "right", top: "89%", offset: "38px", rotate: -65, size: S, type: "oscura"   },
  { side: "right", top: "95%", offset: "8px",  rotate: 45,  size: L, type: "torsion"  },
  { side: "right", top: "99%", offset: "36px", rotate: -30, size: S, type: "base"     },
];

export function LeafScatter() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: leaf.top,
            [leaf.side]: leaf.offset,
            transform: `rotate(${leaf.rotate}deg)`,
          }}
        >
          <Leaf size={leaf.size} type={leaf.type} />
        </div>
      ))}
    </div>
  );
}
