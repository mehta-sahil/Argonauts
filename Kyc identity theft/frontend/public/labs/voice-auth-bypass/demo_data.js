window.DEMO = {
 "episodes": [
  {
   "scenario": "ceo_wire",
   "defense": "none",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, urgent. I'll be on a different line. don't tell your mother.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.451,
       "shimmer_db": 0.26,
       "hnr_db": 25.13,
       "f0_range_semitones": 8.748,
       "f0_contour_smoothness": 0.657,
       "spectral_flatness": 0.239,
       "spectral_tilt_db_oct": -6.881,
       "phase_artifact": 0.209,
       "hf_energy_ratio": 0.079,
       "checkerboard_score": 0.187,
       "breath_rate_pm": 8.615,
       "pause_regularity_cv": 0.616,
       "reverb_rt60_s": 0.107,
       "bg_snr_db": 34.826,
       "latency_glitch_count": 3.546,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.93,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.997,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, immediately. text me on my personal number. keep this off the group thread.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.481,
       "shimmer_db": 0.251,
       "hnr_db": 23.942,
       "f0_range_semitones": 6.539,
       "f0_contour_smoothness": 0.749,
       "spectral_flatness": 0.221,
       "spectral_tilt_db_oct": -7.74,
       "phase_artifact": 0.357,
       "hf_energy_ratio": 0.123,
       "checkerboard_score": 0.231,
       "breath_rate_pm": 5.797,
       "pause_regularity_cv": 0.613,
       "reverb_rt60_s": 0.106,
       "bg_snr_db": 40.509,
       "latency_glitch_count": 3.995,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "none",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond urgent. Please don't tell your mother \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.308,
       "shimmer_db": 0.307,
       "hnr_db": 19.503,
       "f0_range_semitones": 3.198,
       "f0_contour_smoothness": 0.74,
       "spectral_flatness": 0.233,
       "spectral_tilt_db_oct": -7.511,
       "phase_artifact": 0.614,
       "hf_energy_ratio": 0.07,
       "checkerboard_score": 0.156,
       "breath_rate_pm": 6.302,
       "pause_regularity_cv": 0.59,
       "reverb_rt60_s": 0.115,
       "bg_snr_db": 35.476,
       "latency_glitch_count": 5.294,
       "codec_mismatch": 1
      },
      "flagged": [
       "f0_range_semitones",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "f0_range_semitones",
         "phase_artifact",
         "hf_energy_ratio",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.994,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond this can't wait. Please this is confidential \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.36,
       "shimmer_db": 0.27,
       "hnr_db": 23.252,
       "f0_range_semitones": 4.91,
       "f0_contour_smoothness": 0.786,
       "spectral_flatness": 0.236,
       "spectral_tilt_db_oct": -6.456,
       "phase_artifact": 0.418,
       "hf_energy_ratio": 0.094,
       "checkerboard_score": 0.158,
       "breath_rate_pm": 5.589,
       "pause_regularity_cv": 0.253,
       "reverb_rt60_s": 0.063,
       "bg_snr_db": 37.751,
       "latency_glitch_count": 0.099,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "pause_regularity_cv",
       "bg_snr_db",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "pause_regularity_cv",
         "bg_snr_db",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.99,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "none",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $95,000 to the account I'm about to give you, there's no time. reach me on WhatsApp. don't tell your mother.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 95000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.073,
       "shimmer_db": 0.33,
       "hnr_db": 21.585,
       "f0_range_semitones": 9.778,
       "f0_contour_smoothness": 0.748,
       "spectral_flatness": 0.285,
       "spectral_tilt_db_oct": -9.411,
       "phase_artifact": 0.383,
       "hf_energy_ratio": 0.087,
       "checkerboard_score": 0.153,
       "breath_rate_pm": 10.533,
       "pause_regularity_cv": 0.841,
       "reverb_rt60_s": 0.347,
       "bg_snr_db": 35.638,
       "latency_glitch_count": 0.846,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.81,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db"
        ]
       },
       "context": {
        "risk": 0.996,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $95,000 to the account I'm about to give you, this can't wait. text me on my personal number. between us for now.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 95000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.033,
       "shimmer_db": 0.249,
       "hnr_db": 20.296,
       "f0_range_semitones": 9.892,
       "f0_contour_smoothness": 0.503,
       "spectral_flatness": 0.123,
       "spectral_tilt_db_oct": -8.413,
       "phase_artifact": 0.274,
       "hf_energy_ratio": 0.12,
       "checkerboard_score": 0.119,
       "breath_rate_pm": 6.741,
       "pause_regularity_cv": 0.447,
       "reverb_rt60_s": 0.193,
       "bg_snr_db": 25.813,
       "latency_glitch_count": 0.216,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.92,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "none",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $9,000 for a bond urgent. Please this is confidential \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.796,
       "shimmer_db": 0.381,
       "hnr_db": 18.025,
       "f0_range_semitones": 6.963,
       "f0_contour_smoothness": 0.567,
       "spectral_flatness": 0.189,
       "spectral_tilt_db_oct": -8.502,
       "phase_artifact": 0.212,
       "hf_energy_ratio": 0.14,
       "checkerboard_score": 0.131,
       "breath_rate_pm": 14.82,
       "pause_regularity_cv": 0.467,
       "reverb_rt60_s": 0.273,
       "bg_snr_db": 29.342,
       "latency_glitch_count": 2.277,
       "codec_mismatch": 0
      },
      "flagged": [
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.83,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail urgent. I can't talk long. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.689,
       "shimmer_db": 0.412,
       "hnr_db": 20.133,
       "f0_range_semitones": 8.408,
       "f0_contour_smoothness": 0.637,
       "spectral_flatness": 0.298,
       "spectral_tilt_db_oct": -8.805,
       "phase_artifact": 0.107,
       "hf_energy_ratio": 0.105,
       "checkerboard_score": 0.037,
       "breath_rate_pm": 0.046,
       "pause_regularity_cv": 0.61,
       "reverb_rt60_s": 0.306,
       "bg_snr_db": 29.888,
       "latency_glitch_count": 0.812,
       "codec_mismatch": 0
      },
      "flagged": [
       "breath_rate_pm"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.85,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.843,
        "is_spoof": false,
        "flagged": [
         "breath_rate_pm"
        ]
       },
       "context": {
        "risk": 0.949,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "none",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $180,000 to a new account, urgent. keep this off the group thread. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.798,
       "shimmer_db": 0.466,
       "hnr_db": 21.248,
       "f0_range_semitones": 9.071,
       "f0_contour_smoothness": 0.496,
       "spectral_flatness": 0.198,
       "spectral_tilt_db_oct": -9.828,
       "phase_artifact": 0.088,
       "hf_energy_ratio": 0.182,
       "checkerboard_score": 0.089,
       "breath_rate_pm": 11.572,
       "pause_regularity_cv": 0.831,
       "reverb_rt60_s": 0.186,
       "bg_snr_db": 24.376,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.971,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.998,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $180,000 to a new account, urgent. this is confidential. this is the CEO, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.492,
       "shimmer_db": 0.319,
       "hnr_db": 20.151,
       "f0_range_semitones": 13.05,
       "f0_contour_smoothness": 0.597,
       "spectral_flatness": 0.216,
       "spectral_tilt_db_oct": -6.926,
       "phase_artifact": 0.131,
       "hf_energy_ratio": 0.141,
       "checkerboard_score": 0.011,
       "breath_rate_pm": 12.592,
       "pause_regularity_cv": 1.159,
       "reverb_rt60_s": 0.379,
       "bg_snr_db": 19.332,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.92,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.081,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.997,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "none",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $15,000 for bail immediately. I can't talk long. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.158,
       "shimmer_db": 0.389,
       "hnr_db": 18.006,
       "f0_range_semitones": 10.392,
       "f0_contour_smoothness": 0.532,
       "spectral_flatness": 0.186,
       "spectral_tilt_db_oct": -9.518,
       "phase_artifact": 0.137,
       "hf_energy_ratio": 0.184,
       "checkerboard_score": 0.086,
       "breath_rate_pm": 14.463,
       "pause_regularity_cv": 0.882,
       "reverb_rt60_s": 0.124,
       "bg_snr_db": 24.652,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.87,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.937,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.932,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $15,000 for bail this can't wait. don't tell your mother. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.348,
       "shimmer_db": 0.479,
       "hnr_db": 17.104,
       "f0_range_semitones": 6.048,
       "f0_contour_smoothness": 0.523,
       "spectral_flatness": 0.154,
       "spectral_tilt_db_oct": -8.879,
       "phase_artifact": 0.262,
       "hf_energy_ratio": 0.172,
       "checkerboard_score": 0.025,
       "breath_rate_pm": 8.47,
       "pause_regularity_cv": 0.86,
       "reverb_rt60_s": 0.269,
       "bg_snr_db": 18.494,
       "latency_glitch_count": 0.666,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "phase_artifact"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.87,
        "is_spoof": false,
        "flagged": [
         "phase_artifact"
        ]
       },
       "context": {
        "risk": 0.994,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "voiceprint",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $95,000 to the account I'm about to give you, immediately. email my assistant, not me. between us for now.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 95000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.954,
       "shimmer_db": 0.39,
       "hnr_db": 23.077,
       "f0_range_semitones": 8.86,
       "f0_contour_smoothness": 0.701,
       "spectral_flatness": 0.265,
       "spectral_tilt_db_oct": -6.537,
       "phase_artifact": 0.281,
       "hf_energy_ratio": 0.084,
       "checkerboard_score": 0.115,
       "breath_rate_pm": 6.108,
       "pause_regularity_cv": 0.743,
       "reverb_rt60_s": 0.084,
       "bg_snr_db": 37.204,
       "latency_glitch_count": 2.358,
       "codec_mismatch": 1
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.8,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $95,000 to the account I'm about to give you, this can't wait. I'll be on a different line. don't call me back on this number.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 95000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.319,
       "shimmer_db": 0.404,
       "hnr_db": 28.313,
       "f0_range_semitones": 7.593,
       "f0_contour_smoothness": 0.706,
       "spectral_flatness": 0.324,
       "spectral_tilt_db_oct": -8.161,
       "phase_artifact": 0.476,
       "hf_energy_ratio": 0.1,
       "checkerboard_score": 0.209,
       "breath_rate_pm": 7.186,
       "pause_regularity_cv": 0.445,
       "reverb_rt60_s": 0.102,
       "bg_snr_db": 29.415,
       "latency_glitch_count": 3.194,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.78,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.998,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "voiceprint",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $24,000 for bail this can't wait. between us for now. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.538,
       "shimmer_db": 0.194,
       "hnr_db": 23.395,
       "f0_range_semitones": 7.541,
       "f0_contour_smoothness": 0.649,
       "spectral_flatness": 0.238,
       "spectral_tilt_db_oct": -8.956,
       "phase_artifact": 0.471,
       "hf_energy_ratio": 0.138,
       "checkerboard_score": 0.243,
       "breath_rate_pm": 5.081,
       "pause_regularity_cv": 0.721,
       "reverb_rt60_s": 0.042,
       "bg_snr_db": 42.297,
       "latency_glitch_count": 2.801,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "reverb_rt60_s",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.71,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "reverb_rt60_s",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.992,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $24,000 for a bond today. Please this is confidential \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.098,
       "shimmer_db": 0.414,
       "hnr_db": 20.931,
       "f0_range_semitones": 7.045,
       "f0_contour_smoothness": 0.747,
       "spectral_flatness": 0.29,
       "spectral_tilt_db_oct": -9.661,
       "phase_artifact": 0.334,
       "hf_energy_ratio": 0.105,
       "checkerboard_score": 0.206,
       "breath_rate_pm": 8.488,
       "pause_regularity_cv": 0.534,
       "reverb_rt60_s": 0.253,
       "bg_snr_db": 33.437,
       "latency_glitch_count": 4.481,
       "codec_mismatch": 1
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.76,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.996,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "voiceprint",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, right now. this is confidential. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.915,
       "shimmer_db": 0.332,
       "hnr_db": 23.596,
       "f0_range_semitones": 5.877,
       "f0_contour_smoothness": 0.682,
       "spectral_flatness": 0.316,
       "spectral_tilt_db_oct": -9.057,
       "phase_artifact": 0.239,
       "hf_energy_ratio": 0.132,
       "checkerboard_score": 0.099,
       "breath_rate_pm": 13.6,
       "pause_regularity_cv": 0.543,
       "reverb_rt60_s": 0.273,
       "bg_snr_db": 24.553,
       "latency_glitch_count": 3.165,
       "codec_mismatch": 0
      },
      "flagged": [
       "hnr_db",
       "spectral_flatness",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "spectral_flatness",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.998,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, today. don't mention it to the board yet. I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.097,
       "shimmer_db": 0.342,
       "hnr_db": 17.775,
       "f0_range_semitones": 7.357,
       "f0_contour_smoothness": 0.822,
       "spectral_flatness": 0.175,
       "spectral_tilt_db_oct": -10.295,
       "phase_artifact": 0.381,
       "hf_energy_ratio": 0.132,
       "checkerboard_score": 0.182,
       "breath_rate_pm": 10.081,
       "pause_regularity_cv": 0.547,
       "reverb_rt60_s": 0.2,
       "bg_snr_db": 34.757,
       "latency_glitch_count": 3.519,
       "codec_mismatch": 0
      },
      "flagged": [
       "jitter_pct",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "jitter_pct",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "voiceprint",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $24,000 for bail in the next hour. I can't talk long. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.827,
       "shimmer_db": 0.332,
       "hnr_db": 18.942,
       "f0_range_semitones": 12.132,
       "f0_contour_smoothness": 0.666,
       "spectral_flatness": 0.174,
       "spectral_tilt_db_oct": -9.459,
       "phase_artifact": 0.326,
       "hf_energy_ratio": 0.15,
       "checkerboard_score": 0.112,
       "breath_rate_pm": 7.226,
       "pause_regularity_cv": 0.701,
       "reverb_rt60_s": 0.076,
       "bg_snr_db": 24.346,
       "latency_glitch_count": 3.334,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.87,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.947,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $24,000 for bail before the market closes. this is confidential. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.917,
       "shimmer_db": 0.459,
       "hnr_db": 21.878,
       "f0_range_semitones": 8.291,
       "f0_contour_smoothness": 0.882,
       "spectral_flatness": 0.273,
       "spectral_tilt_db_oct": -9.283,
       "phase_artifact": 0.327,
       "hf_energy_ratio": 0.142,
       "checkerboard_score": 0.081,
       "breath_rate_pm": 9.36,
       "pause_regularity_cv": 0.669,
       "reverb_rt60_s": 0.053,
       "bg_snr_db": 28.991,
       "latency_glitch_count": 1.927,
       "codec_mismatch": 0
      },
      "flagged": [
       "f0_contour_smoothness",
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.87,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "f0_contour_smoothness",
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.992,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "voiceprint",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, this can't wait. text me on my personal number. don't call me back on this number.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.982,
       "shimmer_db": 0.449,
       "hnr_db": 14.329,
       "f0_range_semitones": 7.734,
       "f0_contour_smoothness": 0.601,
       "spectral_flatness": 0.195,
       "spectral_tilt_db_oct": -10.384,
       "phase_artifact": 0.111,
       "hf_energy_ratio": 0.131,
       "checkerboard_score": 0.041,
       "breath_rate_pm": 16.464,
       "pause_regularity_cv": 0.665,
       "reverb_rt60_s": 0.434,
       "bg_snr_db": 26.476,
       "latency_glitch_count": 0.27,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.98,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.093,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 1.0,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Crownbridge Media acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, there's no time. don't call me back on this number. as your manager, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.563,
       "shimmer_db": 0.238,
       "hnr_db": 14.283,
       "f0_range_semitones": 8.863,
       "f0_contour_smoothness": 0.528,
       "spectral_flatness": 0.162,
       "spectral_tilt_db_oct": -9.677,
       "phase_artifact": 0.027,
       "hf_energy_ratio": 0.183,
       "checkerboard_score": 0.01,
       "breath_rate_pm": 10.203,
       "pause_regularity_cv": 0.79,
       "reverb_rt60_s": 0.175,
       "bg_snr_db": 17.616,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.006,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "voiceprint",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $4,500 for a bond this can't wait. Please between us for now \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 4500.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.259,
       "shimmer_db": 0.465,
       "hnr_db": 15.014,
       "f0_range_semitones": 8.036,
       "f0_contour_smoothness": 0.459,
       "spectral_flatness": 0.211,
       "spectral_tilt_db_oct": -12.851,
       "phase_artifact": 0.208,
       "hf_energy_ratio": 0.145,
       "checkerboard_score": 0.024,
       "breath_rate_pm": 13.604,
       "pause_regularity_cv": 1.072,
       "reverb_rt60_s": 0.32,
       "bg_snr_db": 27.311,
       "latency_glitch_count": 0.678,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 1.0,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.056,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.989,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $4,500 for a bond immediately. Please don't tell your mother \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 4500.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.48,
       "shimmer_db": 0.399,
       "hnr_db": 21.037,
       "f0_range_semitones": 10.107,
       "f0_contour_smoothness": 0.577,
       "spectral_flatness": 0.141,
       "spectral_tilt_db_oct": -10.254,
       "phase_artifact": 0.183,
       "hf_energy_ratio": 0.113,
       "checkerboard_score": 0.057,
       "breath_rate_pm": 13.635,
       "pause_regularity_cv": 0.925,
       "reverb_rt60_s": 0.074,
       "bg_snr_db": 22.687,
       "latency_glitch_count": 1.036,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.532,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.989,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "antispoof",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, in the next hour. keep this off the group thread. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.427,
       "shimmer_db": 0.29,
       "hnr_db": 21.083,
       "f0_range_semitones": 6.668,
       "f0_contour_smoothness": 0.713,
       "spectral_flatness": 0.435,
       "spectral_tilt_db_oct": -6.659,
       "phase_artifact": 0.32,
       "hf_energy_ratio": 0.065,
       "checkerboard_score": 0.167,
       "breath_rate_pm": 2.231,
       "pause_regularity_cv": 0.424,
       "reverb_rt60_s": 0.084,
       "bg_snr_db": 39.836,
       "latency_glitch_count": 3.222,
       "codec_mismatch": 1
      },
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.81,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "spectral_flatness",
         "phase_artifact",
         "hf_energy_ratio",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, this can't wait. between us for now. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.5,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.375,
       "shimmer_db": 0.204,
       "hnr_db": 21.601,
       "f0_range_semitones": 9.527,
       "f0_contour_smoothness": 0.686,
       "spectral_flatness": 0.149,
       "spectral_tilt_db_oct": -8.411,
       "phase_artifact": 0.133,
       "hf_energy_ratio": 0.17,
       "checkerboard_score": 0.0,
       "breath_rate_pm": 8.485,
       "pause_regularity_cv": 1.048,
       "reverb_rt60_s": 0.44,
       "bg_snr_db": 22.826,
       "latency_glitch_count": 4.332,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.85,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.998,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, before the market closes. don't call me back on this number. as your manager, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.713,
       "shimmer_db": 0.281,
       "hnr_db": 22.591,
       "f0_range_semitones": 10.754,
       "f0_contour_smoothness": 0.522,
       "spectral_flatness": 0.164,
       "spectral_tilt_db_oct": -9.165,
       "phase_artifact": 0.136,
       "hf_energy_ratio": 0.137,
       "checkerboard_score": 0.064,
       "breath_rate_pm": 13.9,
       "pause_regularity_cv": 0.902,
       "reverb_rt60_s": 0.448,
       "bg_snr_db": 26.096,
       "latency_glitch_count": 2.184,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.92,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.997,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Kestrel Foods acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, there's no time. don't mention it to the board yet. I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.611,
       "shimmer_db": 0.314,
       "hnr_db": 13.475,
       "f0_range_semitones": 12.685,
       "f0_contour_smoothness": 0.322,
       "spectral_flatness": 0.214,
       "spectral_tilt_db_oct": -11.246,
       "phase_artifact": 0.071,
       "hf_energy_ratio": 0.162,
       "checkerboard_score": 0.035,
       "breath_rate_pm": 15.142,
       "pause_regularity_cv": 1.254,
       "reverb_rt60_s": 0.336,
       "bg_snr_db": 25.525,
       "latency_glitch_count": 0.853,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.96,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.011,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 4,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, there's no time. email my assistant, not me. don't mention it to the board yet.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.983,
       "shimmer_db": 0.332,
       "hnr_db": 18.67,
       "f0_range_semitones": 9.863,
       "f0_contour_smoothness": 0.573,
       "spectral_flatness": 0.2,
       "spectral_tilt_db_oct": -10.763,
       "phase_artifact": 0.083,
       "hf_energy_ratio": 0.2,
       "checkerboard_score": 0.0,
       "breath_rate_pm": 10.836,
       "pause_regularity_cv": 1.211,
       "reverb_rt60_s": 0.029,
       "bg_snr_db": 19.228,
       "latency_glitch_count": 2.114,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "reverb_rt60_s",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 0.97)",
      "flagged": [
       "reverb_rt60_s",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.84,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.97,
        "is_spoof": true,
        "flagged": [
         "reverb_rt60_s",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 1.0,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": false,
   "rounds": 5,
   "final_quality": 0.8,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": "antispoof"
  },
  {
   "scenario": "family_bail",
   "defense": "antispoof",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond today. Please this is confidential \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.088,
       "shimmer_db": 0.052,
       "hnr_db": 26.3,
       "f0_range_semitones": 9.468,
       "f0_contour_smoothness": 0.839,
       "spectral_flatness": 0.271,
       "spectral_tilt_db_oct": -7.259,
       "phase_artifact": 0.314,
       "hf_energy_ratio": 0.114,
       "checkerboard_score": 0.126,
       "breath_rate_pm": 5.247,
       "pause_regularity_cv": 0.657,
       "reverb_rt60_s": 0.064,
       "bg_snr_db": 34.843,
       "latency_glitch_count": 4.306,
       "codec_mismatch": 1
      },
      "flagged": [
       "shimmer_db",
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "shimmer_db",
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.79,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "shimmer_db",
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.994,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $15,000 for bail urgent. don't mention it to the board yet. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.5,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.964,
       "shimmer_db": 0.341,
       "hnr_db": 18.34,
       "f0_range_semitones": 7.413,
       "f0_contour_smoothness": 0.645,
       "spectral_flatness": 0.147,
       "spectral_tilt_db_oct": -9.885,
       "phase_artifact": 0.085,
       "hf_energy_ratio": 0.209,
       "checkerboard_score": 0.016,
       "breath_rate_pm": 16.436,
       "pause_regularity_cv": 0.891,
       "reverb_rt60_s": 0.386,
       "bg_snr_db": 19.835,
       "latency_glitch_count": 2.367,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.82,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.997,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.99,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond this can't wait. Please don't tell your mother \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.969,
       "shimmer_db": 0.43,
       "hnr_db": 25.252,
       "f0_range_semitones": 12.839,
       "f0_contour_smoothness": 0.58,
       "spectral_flatness": 0.169,
       "spectral_tilt_db_oct": -9.417,
       "phase_artifact": 0.119,
       "hf_energy_ratio": 0.229,
       "checkerboard_score": 0.049,
       "breath_rate_pm": 10.071,
       "pause_regularity_cv": 0.762,
       "reverb_rt60_s": 0.437,
       "bg_snr_db": 23.232,
       "latency_glitch_count": 2.002,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "hnr_db",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 0.99)",
      "flagged": [
       "hnr_db",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.96,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.991,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.994,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond there's no time. Please I can't talk long \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.818,
       "shimmer_db": 0.349,
       "hnr_db": 17.793,
       "f0_range_semitones": 5.684,
       "f0_contour_smoothness": 0.654,
       "spectral_flatness": 0.12,
       "spectral_tilt_db_oct": -10.853,
       "phase_artifact": 0.083,
       "hf_energy_ratio": 0.199,
       "checkerboard_score": 0.029,
       "breath_rate_pm": 13.054,
       "pause_regularity_cv": 0.564,
       "reverb_rt60_s": 0.291,
       "bg_snr_db": 16.095,
       "latency_glitch_count": 1.741,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.765,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.961,
        "high": true
       }
      }
     }
    },
    {
     "round": 4,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $15,000 for bail in the next hour. don't mention it to the board yet. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.931,
       "shimmer_db": 0.572,
       "hnr_db": 20.167,
       "f0_range_semitones": 11.311,
       "f0_contour_smoothness": 0.567,
       "spectral_flatness": 0.17,
       "spectral_tilt_db_oct": -8.551,
       "phase_artifact": 0.175,
       "hf_energy_ratio": 0.118,
       "checkerboard_score": 0.051,
       "breath_rate_pm": 14.798,
       "pause_regularity_cv": 1.092,
       "reverb_rt60_s": 0.347,
       "bg_snr_db": 17.023,
       "latency_glitch_count": 0.291,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 1.0,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.268,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.99,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 5,
   "final_quality": 0.8,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "antispoof",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Kestrel Foods acquisition and I need a deposit wired to their counsel \u2014 $320,000 to a new account, today. I can't talk long. legal has cleared it, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 320000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.947,
       "shimmer_db": 0.297,
       "hnr_db": 13.758,
       "f0_range_semitones": 7.947,
       "f0_contour_smoothness": 0.683,
       "spectral_flatness": 0.339,
       "spectral_tilt_db_oct": -10.7,
       "phase_artifact": 0.412,
       "hf_energy_ratio": 0.12,
       "checkerboard_score": 0.147,
       "breath_rate_pm": 2.038,
       "pause_regularity_cv": 0.72,
       "reverb_rt60_s": 0.18,
       "bg_snr_db": 32.43,
       "latency_glitch_count": 2.41,
       "codec_mismatch": 0
      },
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.84,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.995,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $320,000 to a new account, right now. I can't talk long. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 320000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.224,
       "shimmer_db": 0.443,
       "hnr_db": 20.332,
       "f0_range_semitones": 12.22,
       "f0_contour_smoothness": 0.682,
       "spectral_flatness": 0.179,
       "spectral_tilt_db_oct": -12.036,
       "phase_artifact": 0.051,
       "hf_energy_ratio": 0.224,
       "checkerboard_score": 0.044,
       "breath_rate_pm": 13.357,
       "pause_regularity_cv": 0.813,
       "reverb_rt60_s": 0.303,
       "bg_snr_db": 22.099,
       "latency_glitch_count": 1.11,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.01,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.986,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $320,000 to the account I'm about to give you, urgent. email my assistant, not me. I can't talk long.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 320000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.594,
       "shimmer_db": 0.398,
       "hnr_db": 17.446,
       "f0_range_semitones": 7.135,
       "f0_contour_smoothness": 0.463,
       "spectral_flatness": 0.216,
       "spectral_tilt_db_oct": -8.862,
       "phase_artifact": 0.109,
       "hf_energy_ratio": 0.172,
       "checkerboard_score": 0.024,
       "breath_rate_pm": 9.123,
       "pause_regularity_cv": 1.16,
       "reverb_rt60_s": 0.337,
       "bg_snr_db": 31.905,
       "latency_glitch_count": 0.699,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.91,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.081,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.995,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 3,
   "final_quality": 0.8,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "antispoof",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail urgent. don't call me back on this number. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.051,
       "shimmer_db": 0.32,
       "hnr_db": 17.099,
       "f0_range_semitones": 6.395,
       "f0_contour_smoothness": 0.675,
       "spectral_flatness": 0.254,
       "spectral_tilt_db_oct": -8.907,
       "phase_artifact": 0.345,
       "hf_energy_ratio": 0.161,
       "checkerboard_score": 0.131,
       "breath_rate_pm": 9.225,
       "pause_regularity_cv": 0.655,
       "reverb_rt60_s": 0.247,
       "bg_snr_db": 33.379,
       "latency_glitch_count": 2.372,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 1.00)",
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.92,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $9,000 for a bond there's no time. Please don't call me back on this number \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.837,
       "shimmer_db": 0.24,
       "hnr_db": 16.498,
       "f0_range_semitones": 10.577,
       "f0_contour_smoothness": 0.664,
       "spectral_flatness": 0.26,
       "spectral_tilt_db_oct": -9.916,
       "phase_artifact": 0.163,
       "hf_energy_ratio": 0.223,
       "checkerboard_score": 0.05,
       "breath_rate_pm": 10.87,
       "pause_regularity_cv": 0.863,
       "reverb_rt60_s": 0.313,
       "bg_snr_db": 18.057,
       "latency_glitch_count": 1.905,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 0.93)",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.97,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.927,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail in the next hour. keep this off the group thread. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.9500000000000001,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.896,
       "shimmer_db": 0.604,
       "hnr_db": 16.755,
       "f0_range_semitones": 9.553,
       "f0_contour_smoothness": 0.521,
       "spectral_flatness": 0.145,
       "spectral_tilt_db_oct": -9.373,
       "phase_artifact": 0.121,
       "hf_energy_ratio": 0.236,
       "checkerboard_score": 0.042,
       "breath_rate_pm": 14.882,
       "pause_regularity_cv": 0.856,
       "reverb_rt60_s": 0.159,
       "bg_snr_db": 21.642,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.99,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.003,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail this can't wait. keep this off the group thread. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.9500000000000001,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.049,
       "shimmer_db": 0.574,
       "hnr_db": 19.295,
       "f0_range_semitones": 11.838,
       "f0_contour_smoothness": 0.578,
       "spectral_flatness": 0.19,
       "spectral_tilt_db_oct": -9.02,
       "phase_artifact": 0.166,
       "hf_energy_ratio": 0.142,
       "checkerboard_score": 0.04,
       "breath_rate_pm": 22.174,
       "pause_regularity_cv": 0.882,
       "reverb_rt60_s": 0.274,
       "bg_snr_db": 19.23,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "breath_rate_pm"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 1.0,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.007,
        "is_spoof": false,
        "flagged": [
         "breath_rate_pm"
        ]
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 4,
   "final_quality": 0.95,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "antispoof",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, immediately. reach me on WhatsApp. don't call me back on this number.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.225,
       "shimmer_db": 0.369,
       "hnr_db": 12.497,
       "f0_range_semitones": 8.08,
       "f0_contour_smoothness": 0.436,
       "spectral_flatness": 0.207,
       "spectral_tilt_db_oct": -9.682,
       "phase_artifact": 0.099,
       "hf_energy_ratio": 0.149,
       "checkerboard_score": 0.079,
       "breath_rate_pm": 9.188,
       "pause_regularity_cv": 0.692,
       "reverb_rt60_s": 0.264,
       "bg_snr_db": 20.303,
       "latency_glitch_count": 0.287,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.97,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.058,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, right now. reach me on WhatsApp. don't mention it to the board yet.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.645,
       "shimmer_db": 0.233,
       "hnr_db": 17.43,
       "f0_range_semitones": 9.84,
       "f0_contour_smoothness": 0.557,
       "spectral_flatness": 0.179,
       "spectral_tilt_db_oct": -10.33,
       "phase_artifact": 0.195,
       "hf_energy_ratio": 0.146,
       "checkerboard_score": 0.04,
       "breath_rate_pm": 12.45,
       "pause_regularity_cv": 0.892,
       "reverb_rt60_s": 0.27,
       "bg_snr_db": 27.097,
       "latency_glitch_count": 0.579,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.95,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.089,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "family_bail",
   "defense": "antispoof",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $24,000 for bail this can't wait. don't tell your mother. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.042,
       "shimmer_db": 0.31,
       "hnr_db": 15.421,
       "f0_range_semitones": 7.477,
       "f0_contour_smoothness": 0.589,
       "spectral_flatness": 0.152,
       "spectral_tilt_db_oct": -11.401,
       "phase_artifact": 0.154,
       "hf_energy_ratio": 0.184,
       "checkerboard_score": 0.002,
       "breath_rate_pm": 18.195,
       "pause_regularity_cv": 0.877,
       "reverb_rt60_s": 0.276,
       "bg_snr_db": 27.367,
       "latency_glitch_count": 0.634,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.91,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.02,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.996,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $24,000 for a bond there's no time. Please don't call me back on this number \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.802,
       "shimmer_db": 0.303,
       "hnr_db": 17.233,
       "f0_range_semitones": 11.584,
       "f0_contour_smoothness": 0.441,
       "spectral_flatness": 0.183,
       "spectral_tilt_db_oct": -9.251,
       "phase_artifact": 0.27,
       "hf_energy_ratio": 0.129,
       "checkerboard_score": 0.041,
       "breath_rate_pm": 14.69,
       "pause_regularity_cv": 0.887,
       "reverb_rt60_s": 0.17,
       "bg_snr_db": 24.733,
       "latency_glitch_count": 0.66,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "phase_artifact"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "antispoof",
      "detail": "liveness check failed (spoof prob 0.91)",
      "flagged": [
       "phase_artifact"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.96,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.913,
        "is_spoof": true,
        "flagged": [
         "phase_artifact"
        ]
       },
       "context": {
        "risk": 0.992,
        "high": true
       }
      }
     },
     "delivery": true
    }
   ],
   "success": false,
   "rounds": 2,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": "antispoof"
  },
  {
   "scenario": "ceo_wire",
   "defense": "context",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, today. I'll be on a different line. don't call me back on this number.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.668,
       "shimmer_db": 0.38,
       "hnr_db": 22.645,
       "f0_range_semitones": 6.371,
       "f0_contour_smoothness": 0.819,
       "spectral_flatness": 0.305,
       "spectral_tilt_db_oct": -8.11,
       "phase_artifact": 0.399,
       "hf_energy_ratio": 0.077,
       "checkerboard_score": 0.232,
       "breath_rate_pm": 7.798,
       "pause_regularity_cv": 0.517,
       "reverb_rt60_s": 0.224,
       "bg_snr_db": 29.942,
       "latency_glitch_count": 3.486,
       "codec_mismatch": 1
      },
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 1.00 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Kestrel Foods acquisition and I need a deposit wired to their counsel \u2014 $300,000 to a new account, there's no time. . legal has cleared it, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 300000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.473,
       "shimmer_db": 0.133,
       "hnr_db": 26.11,
       "f0_range_semitones": 7.619,
       "f0_contour_smoothness": 0.664,
       "spectral_flatness": 0.325,
       "spectral_tilt_db_oct": -9.125,
       "phase_artifact": 0.267,
       "hf_energy_ratio": 0.087,
       "checkerboard_score": 0.161,
       "breath_rate_pm": 3.324,
       "pause_regularity_cv": 0.467,
       "reverb_rt60_s": 0.067,
       "bg_snr_db": 36.35,
       "latency_glitch_count": 3.875,
       "codec_mismatch": 1
      },
      "flagged": [
       "shimmer_db",
       "hnr_db",
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.99 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "shimmer_db",
         "hnr_db",
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.995,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, before the market closes. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.466,
       "shimmer_db": 0.157,
       "hnr_db": 20.195,
       "f0_range_semitones": 6.237,
       "f0_contour_smoothness": 0.885,
       "spectral_flatness": 0.329,
       "spectral_tilt_db_oct": -8.626,
       "phase_artifact": 0.485,
       "hf_energy_ratio": 0.059,
       "checkerboard_score": 0.25,
       "breath_rate_pm": 4.902,
       "pause_regularity_cv": 0.621,
       "reverb_rt60_s": 0.156,
       "bg_snr_db": 35.0,
       "latency_glitch_count": 4.522,
       "codec_mismatch": 1
      },
      "flagged": [
       "shimmer_db",
       "f0_contour_smoothness",
       "spectral_flatness",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.95 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.8,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "shimmer_db",
         "f0_contour_smoothness",
         "spectral_flatness",
         "phase_artifact",
         "hf_energy_ratio",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.949,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Crownbridge Media acquisition and I need a deposit wired to their counsel \u2014 $108,000 to a new account, this can't wait. . as your manager, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": true,
       "amount": 108000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.543,
       "shimmer_db": 0.367,
       "hnr_db": 32.009,
       "f0_range_semitones": 7.899,
       "f0_contour_smoothness": 0.768,
       "spectral_flatness": 0.224,
       "spectral_tilt_db_oct": -6.4,
       "phase_artifact": 0.236,
       "hf_energy_ratio": 0.069,
       "checkerboard_score": 0.211,
       "breath_rate_pm": 3.088,
       "pause_regularity_cv": 0.725,
       "reverb_rt60_s": 0.182,
       "bg_snr_db": 33.835,
       "latency_glitch_count": 2.898,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "hf_energy_ratio",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.83 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.78,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "hf_energy_ratio",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.827,
        "high": true
       }
      }
     }
    },
    {
     "round": 11,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $40,000 to the account I'm about to give you, there's no time. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": true,
       "amount": 40000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 11,
      "biomarkers": {
       "jitter_pct": 0.807,
       "shimmer_db": 0.323,
       "hnr_db": 25.461,
       "f0_range_semitones": 6.784,
       "f0_contour_smoothness": 0.694,
       "spectral_flatness": 0.32,
       "spectral_tilt_db_oct": -6.842,
       "phase_artifact": 0.597,
       "hf_energy_ratio": 0.037,
       "checkerboard_score": 0.179,
       "breath_rate_pm": 8.115,
       "pause_regularity_cv": 0.349,
       "reverb_rt60_s": 0.11,
       "bg_snr_db": 44.654,
       "latency_glitch_count": 6.548,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "spectral_flatness",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "pause_regularity_cv",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.51 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.81,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "spectral_flatness",
         "phase_artifact",
         "hf_energy_ratio",
         "checkerboard_score",
         "pause_regularity_cv",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.509,
        "high": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 12,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": "context"
  },
  {
   "scenario": "family_bail",
   "defense": "context",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail urgent. don't call me back on this number. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.575,
       "shimmer_db": 0.203,
       "hnr_db": 26.369,
       "f0_range_semitones": 5.539,
       "f0_contour_smoothness": 0.82,
       "spectral_flatness": 0.266,
       "spectral_tilt_db_oct": -9.326,
       "phase_artifact": 0.532,
       "hf_energy_ratio": 0.023,
       "checkerboard_score": 0.141,
       "breath_rate_pm": 6.744,
       "pause_regularity_cv": 0.471,
       "reverb_rt60_s": 0.164,
       "bg_snr_db": 35.798,
       "latency_glitch_count": 3.127,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "hf_energy_ratio",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.99 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.96,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "hf_energy_ratio",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.987,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $5,400 for bail urgent. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 5400.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.518,
       "shimmer_db": 0.261,
       "hnr_db": 20.767,
       "f0_range_semitones": 5.403,
       "f0_contour_smoothness": 0.815,
       "spectral_flatness": 0.315,
       "spectral_tilt_db_oct": -7.752,
       "phase_artifact": 0.33,
       "hf_energy_ratio": 0.11,
       "checkerboard_score": 0.091,
       "breath_rate_pm": 5.053,
       "pause_regularity_cv": 0.486,
       "reverb_rt60_s": 0.077,
       "bg_snr_db": 36.835,
       "latency_glitch_count": 2.745,
       "codec_mismatch": 1
      },
      "flagged": [
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.93 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.81,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.934,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $3,240 for a bond today. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 3240.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.925,
       "shimmer_db": 0.34,
       "hnr_db": 25.75,
       "f0_range_semitones": 6.813,
       "f0_contour_smoothness": 0.841,
       "spectral_flatness": 0.327,
       "spectral_tilt_db_oct": -6.159,
       "phase_artifact": 0.624,
       "hf_energy_ratio": 0.086,
       "checkerboard_score": 0.207,
       "breath_rate_pm": 5.712,
       "pause_regularity_cv": 0.047,
       "reverb_rt60_s": 0.048,
       "bg_snr_db": 36.337,
       "latency_glitch_count": 5.151,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "spectral_flatness",
       "spectral_tilt_db_oct",
       "phase_artifact",
       "checkerboard_score",
       "pause_regularity_cv",
       "reverb_rt60_s",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.69 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.82,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "spectral_flatness",
         "spectral_tilt_db_oct",
         "phase_artifact",
         "checkerboard_score",
         "pause_regularity_cv",
         "reverb_rt60_s",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.689,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $1,944 for bail this can't wait. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": true,
       "amount": 1944.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.793,
       "shimmer_db": 0.388,
       "hnr_db": 22.261,
       "f0_range_semitones": 9.224,
       "f0_contour_smoothness": 0.906,
       "spectral_flatness": 0.31,
       "spectral_tilt_db_oct": -9.012,
       "phase_artifact": 0.539,
       "hf_energy_ratio": 0.087,
       "checkerboard_score": 0.17,
       "breath_rate_pm": 6.1,
       "pause_regularity_cv": 0.45,
       "reverb_rt60_s": 0.183,
       "bg_snr_db": 39.403,
       "latency_glitch_count": 6.24,
       "codec_mismatch": 1
      },
      "flagged": [
       "f0_contour_smoothness",
       "spectral_flatness",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "f0_contour_smoothness",
         "spectral_flatness",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.172,
        "high": false
       }
      }
     }
    },
    {
     "round": 4,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $1,944 for a bond this can't wait. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": true,
       "amount": 1944.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.408,
       "shimmer_db": 0.263,
       "hnr_db": 25.079,
       "f0_range_semitones": 6.04,
       "f0_contour_smoothness": 1.001,
       "spectral_flatness": 0.27,
       "spectral_tilt_db_oct": -8.49,
       "phase_artifact": 0.509,
       "hf_energy_ratio": 0.112,
       "checkerboard_score": 0.191,
       "breath_rate_pm": 5.343,
       "pause_regularity_cv": 0.581,
       "reverb_rt60_s": 0.17,
       "bg_snr_db": 39.351,
       "latency_glitch_count": 3.451,
       "codec_mismatch": 1
      },
      "flagged": [
       "hnr_db",
       "f0_contour_smoothness",
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.87,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "f0_contour_smoothness",
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.172,
        "high": false
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 5,
   "final_quality": 0.35,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "context",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $320,000 to the account I'm about to give you, today. reach me on WhatsApp. between us for now.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 320000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.497,
       "shimmer_db": 0.237,
       "hnr_db": 21.334,
       "f0_range_semitones": 10.32,
       "f0_contour_smoothness": 0.531,
       "spectral_flatness": 0.33,
       "spectral_tilt_db_oct": -6.719,
       "phase_artifact": 0.242,
       "hf_energy_ratio": 0.113,
       "checkerboard_score": 0.115,
       "breath_rate_pm": 11.908,
       "pause_regularity_cv": 0.634,
       "reverb_rt60_s": 0.122,
       "bg_snr_db": 31.085,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0
      },
      "flagged": [
       "spectral_flatness",
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 1.00 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "spectral_flatness",
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Meridian Logistics acquisition and I need a deposit wired to their counsel \u2014 $192,000 to a new account, immediately. . this is the CEO, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 192000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 1.126,
       "shimmer_db": 0.372,
       "hnr_db": 22.142,
       "f0_range_semitones": 9.217,
       "f0_contour_smoothness": 0.738,
       "spectral_flatness": 0.244,
       "spectral_tilt_db_oct": -9.932,
       "phase_artifact": 0.254,
       "hf_energy_ratio": 0.126,
       "checkerboard_score": 0.169,
       "breath_rate_pm": 13.703,
       "pause_regularity_cv": 0.766,
       "reverb_rt60_s": 0.149,
       "bg_snr_db": 26.781,
       "latency_glitch_count": 2.058,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.98 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.97,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.982,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $115,200 to the account I'm about to give you, before the market closes. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 115200.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.903,
       "shimmer_db": 0.338,
       "hnr_db": 18.546,
       "f0_range_semitones": 9.975,
       "f0_contour_smoothness": 0.694,
       "spectral_flatness": 0.233,
       "spectral_tilt_db_oct": -8.631,
       "phase_artifact": 0.396,
       "hf_energy_ratio": 0.123,
       "checkerboard_score": 0.187,
       "breath_rate_pm": 12.628,
       "pause_regularity_cv": 0.706,
       "reverb_rt60_s": 0.272,
       "bg_snr_db": 29.205,
       "latency_glitch_count": 1.247,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.94 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.936,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $69,120 to a new account, this can't wait. . I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": true,
       "amount": 69120.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.568,
       "shimmer_db": 0.391,
       "hnr_db": 20.359,
       "f0_range_semitones": 9.36,
       "f0_contour_smoothness": 0.747,
       "spectral_flatness": 0.069,
       "spectral_tilt_db_oct": -8.34,
       "phase_artifact": 0.136,
       "hf_energy_ratio": 0.133,
       "checkerboard_score": 0.082,
       "breath_rate_pm": 9.442,
       "pause_regularity_cv": 0.922,
       "reverb_rt60_s": 0.077,
       "bg_snr_db": 30.463,
       "latency_glitch_count": 2.196,
       "codec_mismatch": 0
      },
      "flagged": [
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.58 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.8,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.58,
        "high": true
       }
      }
     }
    },
    {
     "round": 11,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Crownbridge Media acquisition and I need a deposit wired to their counsel \u2014 $40,000 to a new account, this can't wait. . I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": true,
       "amount": 40000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 11,
      "biomarkers": {
       "jitter_pct": 0.388,
       "shimmer_db": 0.395,
       "hnr_db": 18.954,
       "f0_range_semitones": 6.67,
       "f0_contour_smoothness": 0.581,
       "spectral_flatness": 0.301,
       "spectral_tilt_db_oct": -7.62,
       "phase_artifact": 0.217,
       "hf_energy_ratio": 0.09,
       "checkerboard_score": 0.118,
       "breath_rate_pm": 7.863,
       "pause_regularity_cv": 0.971,
       "reverb_rt60_s": 0.095,
       "bg_snr_db": 22.381,
       "latency_glitch_count": 1.971,
       "codec_mismatch": 0
      },
      "flagged": [
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.51 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.509,
        "high": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 12,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": "context"
  },
  {
   "scenario": "family_bail",
   "defense": "context",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $15,000 for bail there's no time. don't call me back on this number. He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.4,
       "shimmer_db": 0.181,
       "hnr_db": 20.946,
       "f0_range_semitones": 9.95,
       "f0_contour_smoothness": 0.859,
       "spectral_flatness": 0.233,
       "spectral_tilt_db_oct": -9.105,
       "phase_artifact": 0.188,
       "hf_energy_ratio": 0.161,
       "checkerboard_score": 0.133,
       "breath_rate_pm": 7.484,
       "pause_regularity_cv": 0.811,
       "reverb_rt60_s": 0.248,
       "bg_snr_db": 22.22,
       "latency_glitch_count": 3.235,
       "codec_mismatch": 0
      },
      "flagged": [
       "f0_contour_smoothness",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.99 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "f0_contour_smoothness",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.99,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $9,000 for a bond immediately. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.707,
       "shimmer_db": 0.304,
       "hnr_db": 24.39,
       "f0_range_semitones": 11.253,
       "f0_contour_smoothness": 0.846,
       "spectral_flatness": 0.175,
       "spectral_tilt_db_oct": -9.688,
       "phase_artifact": 0.338,
       "hf_energy_ratio": 0.088,
       "checkerboard_score": 0.088,
       "breath_rate_pm": 4.098,
       "pause_regularity_cv": 1.003,
       "reverb_rt60_s": 0.286,
       "bg_snr_db": 31.534,
       "latency_glitch_count": 2.572,
       "codec_mismatch": 0
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.91 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.913,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $5,400 for a bond today. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 5400.0,
       "payee_registered": true,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.706,
       "shimmer_db": 0.4,
       "hnr_db": 18.67,
       "f0_range_semitones": 10.65,
       "f0_contour_smoothness": 0.617,
       "spectral_flatness": 0.189,
       "spectral_tilt_db_oct": -6.964,
       "phase_artifact": 0.26,
       "hf_energy_ratio": 0.146,
       "checkerboard_score": 0.1,
       "breath_rate_pm": 2.85,
       "pause_regularity_cv": 0.787,
       "reverb_rt60_s": 0.104,
       "bg_snr_db": 34.029,
       "latency_glitch_count": 0.333,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.84 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.8,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db"
        ]
       },
       "context": {
        "risk": 0.837,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $3,240 for a bond this can't wait. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": true,
       "amount": 3240.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.896,
       "shimmer_db": 0.383,
       "hnr_db": 20.573,
       "f0_range_semitones": 5.877,
       "f0_contour_smoothness": 0.753,
       "spectral_flatness": 0.158,
       "spectral_tilt_db_oct": -9.423,
       "phase_artifact": 0.212,
       "hf_energy_ratio": 0.116,
       "checkerboard_score": 0.152,
       "breath_rate_pm": 7.375,
       "pause_regularity_cv": 0.79,
       "reverb_rt60_s": 0.258,
       "bg_snr_db": 22.856,
       "latency_glitch_count": 0.819,
       "codec_mismatch": 0
      },
      "flagged": [
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.999,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.215,
        "high": false
       }
      }
     }
    },
    {
     "round": 4,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $3,240 for bail before the market closes. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": true,
       "amount": 3240.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.653,
       "shimmer_db": 0.372,
       "hnr_db": 15.834,
       "f0_range_semitones": 9.659,
       "f0_contour_smoothness": 0.739,
       "spectral_flatness": 0.227,
       "spectral_tilt_db_oct": -10.704,
       "phase_artifact": 0.271,
       "hf_energy_ratio": 0.11,
       "checkerboard_score": 0.141,
       "breath_rate_pm": 8.911,
       "pause_regularity_cv": 0.817,
       "reverb_rt60_s": 0.173,
       "bg_snr_db": 35.47,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "bg_snr_db"
      ]
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.85,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "bg_snr_db"
        ]
       },
       "context": {
        "risk": 0.215,
        "high": false
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 5,
   "final_quality": 0.65,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "context",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, this can't wait. don't tell your mother. I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.294,
       "shimmer_db": 0.441,
       "hnr_db": 17.155,
       "f0_range_semitones": 8.765,
       "f0_contour_smoothness": 0.507,
       "spectral_flatness": 0.174,
       "spectral_tilt_db_oct": -11.659,
       "phase_artifact": 0.169,
       "hf_energy_ratio": 0.163,
       "checkerboard_score": 0.045,
       "breath_rate_pm": 13.602,
       "pause_regularity_cv": 1.012,
       "reverb_rt60_s": 0.229,
       "bg_snr_db": 22.675,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 1.00 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.83,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.052,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $300,000 to the account I'm about to give you, immediately. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 300000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.402,
       "shimmer_db": 0.561,
       "hnr_db": 12.955,
       "f0_range_semitones": 10.772,
       "f0_contour_smoothness": 0.739,
       "spectral_flatness": 0.165,
       "spectral_tilt_db_oct": -7.405,
       "phase_artifact": 0.24,
       "hf_energy_ratio": 0.201,
       "checkerboard_score": 0.097,
       "breath_rate_pm": 14.567,
       "pause_regularity_cv": 0.729,
       "reverb_rt60_s": 0.337,
       "bg_snr_db": 21.337,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "checkerboard_score"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.99 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.999,
        "is_spoof": true,
        "flagged": [
         "checkerboard_score"
        ]
       },
       "context": {
        "risk": 0.985,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, before the market closes. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 1.843,
       "shimmer_db": 0.356,
       "hnr_db": 17.43,
       "f0_range_semitones": 8.328,
       "f0_contour_smoothness": 0.583,
       "spectral_flatness": 0.176,
       "spectral_tilt_db_oct": -10.421,
       "phase_artifact": 0.077,
       "hf_energy_ratio": 0.109,
       "checkerboard_score": 0.026,
       "breath_rate_pm": 13.485,
       "pause_regularity_cv": 1.278,
       "reverb_rt60_s": 0.389,
       "bg_snr_db": 30.447,
       "latency_glitch_count": 0.932,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.95 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.049,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.949,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $108,000 to the account I'm about to give you, before the market closes. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": true,
       "amount": 108000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 0.616,
       "shimmer_db": 0.411,
       "hnr_db": 12.208,
       "f0_range_semitones": 9.136,
       "f0_contour_smoothness": 0.759,
       "spectral_flatness": 0.206,
       "spectral_tilt_db_oct": -8.122,
       "phase_artifact": 0.122,
       "hf_energy_ratio": 0.111,
       "checkerboard_score": 0.032,
       "breath_rate_pm": 11.171,
       "pause_regularity_cv": 1.11,
       "reverb_rt60_s": 0.479,
       "bg_snr_db": 20.225,
       "latency_glitch_count": 0.351,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.64 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.175,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.637,
        "high": true
       }
      }
     }
    },
    {
     "round": 11,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $40,000 to the account I'm about to give you, urgent. . .",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": true,
       "amount": 40000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 11,
      "biomarkers": {
       "jitter_pct": 1.45,
       "shimmer_db": 0.417,
       "hnr_db": 15.257,
       "f0_range_semitones": 12.179,
       "f0_contour_smoothness": 0.594,
       "spectral_flatness": 0.196,
       "spectral_tilt_db_oct": -9.631,
       "phase_artifact": 0.198,
       "hf_energy_ratio": 0.198,
       "checkerboard_score": 0.049,
       "breath_rate_pm": 7.349,
       "pause_regularity_cv": 0.802,
       "reverb_rt60_s": 0.302,
       "bg_snr_db": 30.486,
       "latency_glitch_count": 0.888,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.51 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.94,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.33,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.509,
        "high": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 12,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": "context"
  },
  {
   "scenario": "family_bail",
   "defense": "context",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond there's no time. Please don't call me back on this number \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.326,
       "shimmer_db": 0.371,
       "hnr_db": 15.905,
       "f0_range_semitones": 9.272,
       "f0_contour_smoothness": 0.509,
       "spectral_flatness": 0.208,
       "spectral_tilt_db_oct": -10.069,
       "phase_artifact": 0.112,
       "hf_energy_ratio": 0.148,
       "checkerboard_score": 0.058,
       "breath_rate_pm": 15.904,
       "pause_regularity_cv": 1.059,
       "reverb_rt60_s": 0.359,
       "bg_snr_db": 10.14,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "bg_snr_db"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.99 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.93,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.041,
        "is_spoof": false,
        "flagged": [
         "bg_snr_db"
        ]
       },
       "context": {
        "risk": 0.99,
        "high": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail urgent. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 1.148,
       "shimmer_db": 0.255,
       "hnr_db": 21.141,
       "f0_range_semitones": 10.535,
       "f0_contour_smoothness": 0.501,
       "spectral_flatness": 0.199,
       "spectral_tilt_db_oct": -10.251,
       "phase_artifact": 0.104,
       "hf_energy_ratio": 0.186,
       "checkerboard_score": 0.033,
       "breath_rate_pm": 7.854,
       "pause_regularity_cv": 0.759,
       "reverb_rt60_s": 0.281,
       "bg_snr_db": 19.023,
       "latency_glitch_count": 1.504,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.91 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.473,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.913,
        "high": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $5,400 for a bond right now. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 5400.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 1.675,
       "shimmer_db": 0.504,
       "hnr_db": 15.297,
       "f0_range_semitones": 10.166,
       "f0_contour_smoothness": 0.712,
       "spectral_flatness": 0.182,
       "spectral_tilt_db_oct": -11.503,
       "phase_artifact": 0.151,
       "hf_energy_ratio": 0.244,
       "checkerboard_score": 0.01,
       "breath_rate_pm": 14.554,
       "pause_regularity_cv": 0.886,
       "reverb_rt60_s": 0.281,
       "bg_snr_db": 21.803,
       "latency_glitch_count": 0.409,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "context",
      "detail": "call-context risk 0.74 (new payee / urgency / secrecy)",
      "layers": {
       "voiceprint": {
        "score": 1.0,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.002,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.744,
        "high": true
       }
      }
     }
    },
    {
     "round": 3,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $3,240 for a bond there's no time. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": true,
       "amount": 3240.0,
       "payee_registered": true,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 1.284,
       "shimmer_db": 0.317,
       "hnr_db": 21.5,
       "f0_range_semitones": 7.088,
       "f0_contour_smoothness": 0.652,
       "spectral_flatness": 0.201,
       "spectral_tilt_db_oct": -7.943,
       "phase_artifact": 0.164,
       "hf_energy_ratio": 0.208,
       "checkerboard_score": 0.044,
       "breath_rate_pm": 15.996,
       "pause_regularity_cv": 0.952,
       "reverb_rt60_s": 0.501,
       "bg_snr_db": 20.601,
       "latency_glitch_count": 1.464,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 0.97,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.601,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.326,
        "high": false
       }
      }
     }
    },
    {
     "round": 4,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $3,240 for a bond today. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": true,
       "amount": 3240.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 3,
      "biomarkers": {
       "jitter_pct": 1.143,
       "shimmer_db": 0.36,
       "hnr_db": 18.761,
       "f0_range_semitones": 6.716,
       "f0_contour_smoothness": 0.415,
       "spectral_flatness": 0.228,
       "spectral_tilt_db_oct": -12.026,
       "phase_artifact": 0.222,
       "hf_energy_ratio": 0.156,
       "checkerboard_score": 0.05,
       "breath_rate_pm": 12.957,
       "pause_regularity_cv": 0.967,
       "reverb_rt60_s": 0.267,
       "bg_snr_db": 21.928,
       "latency_glitch_count": 0.549,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": true,
      "blocked_by": null,
      "detail": "voice auth accepted",
      "layers": {
       "voiceprint": {
        "score": 1.0,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.461,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.215,
        "high": false
       }
      }
     },
     "delivery": true
    }
   ],
   "success": true,
   "rounds": 5,
   "final_quality": 0.95,
   "final_evasions": [],
   "blocked_by": null
  },
  {
   "scenario": "ceo_wire",
   "defense": "full",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $500,000 to the account I'm about to give you, before the market closes. reach me on WhatsApp. don't mention it to the board yet.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.581,
       "shimmer_db": 0.336,
       "hnr_db": 22.875,
       "f0_range_semitones": 8.045,
       "f0_contour_smoothness": 0.822,
       "spectral_flatness": 0.2,
       "spectral_tilt_db_oct": -8.152,
       "phase_artifact": 0.442,
       "hf_energy_ratio": 0.116,
       "checkerboard_score": 0.273,
       "breath_rate_pm": 1.621,
       "pause_regularity_cv": 0.51,
       "reverb_rt60_s": 0.161,
       "bg_snr_db": 41.01,
       "latency_glitch_count": 7.005,
       "codec_mismatch": 1
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "bg_snr_db",
       "latency_glitch_count",
       "codec_mismatch"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.8,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "bg_snr_db",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.998,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Crownbridge Media acquisition and I need a deposit wired to their counsel \u2014 $300,000 to a new account, today. . I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 300000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.5,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.596,
       "shimmer_db": 0.214,
       "hnr_db": 23.499,
       "f0_range_semitones": 7.058,
       "f0_contour_smoothness": 0.687,
       "spectral_flatness": 0.225,
       "spectral_tilt_db_oct": -9.324,
       "phase_artifact": 0.011,
       "hf_energy_ratio": 0.142,
       "checkerboard_score": 0.044,
       "breath_rate_pm": 7.996,
       "pause_regularity_cv": 0.847,
       "reverb_rt60_s": 0.287,
       "bg_snr_db": 25.394,
       "latency_glitch_count": 3.535,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "hnr_db",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [
       "hnr_db",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.985,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, in the next hour. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.688,
       "shimmer_db": 0.341,
       "hnr_db": 19.945,
       "f0_range_semitones": 11.515,
       "f0_contour_smoothness": 0.525,
       "spectral_flatness": 0.23,
       "spectral_tilt_db_oct": -12.563,
       "phase_artifact": 0.178,
       "hf_energy_ratio": 0.162,
       "checkerboard_score": 0.052,
       "breath_rate_pm": 13.18,
       "pause_regularity_cv": 1.063,
       "reverb_rt60_s": 0.444,
       "bg_snr_db": 19.684,
       "latency_glitch_count": 2.355,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.994,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.949,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.65,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": "auth_protocol"
  },
  {
   "scenario": "family_bail",
   "defense": "full",
   "quality": 0.35,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $4,500 for a bond this can't wait. Please I can't talk long \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 4500.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.35,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.602,
       "shimmer_db": 0.135,
       "hnr_db": 22.738,
       "f0_range_semitones": 6.265,
       "f0_contour_smoothness": 0.699,
       "spectral_flatness": 0.271,
       "spectral_tilt_db_oct": -9.756,
       "phase_artifact": 0.528,
       "hf_energy_ratio": 0.103,
       "checkerboard_score": 0.3,
       "breath_rate_pm": 3.879,
       "pause_regularity_cv": 0.363,
       "reverb_rt60_s": 0.138,
       "bg_snr_db": 29.577,
       "latency_glitch_count": 4.354,
       "codec_mismatch": 1
      },
      "flagged": [
       "shimmer_db",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "pause_regularity_cv",
       "latency_glitch_count",
       "codec_mismatch"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [
       "shimmer_db",
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm",
       "pause_regularity_cv",
       "latency_glitch_count",
       "codec_mismatch"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.82,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "shimmer_db",
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm",
         "pause_regularity_cv",
         "latency_glitch_count",
         "codec_mismatch"
        ]
       },
       "context": {
        "risk": 0.879,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $2,700 for bail today. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 2700.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.5,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.605,
       "shimmer_db": 0.33,
       "hnr_db": 21.776,
       "f0_range_semitones": 10.841,
       "f0_contour_smoothness": 0.768,
       "spectral_flatness": 0.114,
       "spectral_tilt_db_oct": -8.599,
       "phase_artifact": 0.052,
       "hf_energy_ratio": 0.172,
       "checkerboard_score": 0.005,
       "breath_rate_pm": 10.015,
       "pause_regularity_cv": 1.153,
       "reverb_rt60_s": 0.241,
       "bg_snr_db": 19.313,
       "latency_glitch_count": 2.234,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.86,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.97,
        "is_spoof": true,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.848,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $1,620 for a bond right now. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 1620.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 1.187,
       "shimmer_db": 0.231,
       "hnr_db": 17.399,
       "f0_range_semitones": 11.179,
       "f0_contour_smoothness": 0.356,
       "spectral_flatness": 0.16,
       "spectral_tilt_db_oct": -8.38,
       "phase_artifact": 0.118,
       "hf_energy_ratio": 0.149,
       "checkerboard_score": 0.015,
       "breath_rate_pm": 9.693,
       "pause_regularity_cv": 0.775,
       "reverb_rt60_s": 0.309,
       "bg_snr_db": 26.751,
       "latency_glitch_count": 3.45,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.87,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.807,
        "is_spoof": false,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.606,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.65,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": "auth_protocol"
  },
  {
   "scenario": "ceo_wire",
   "defense": "full",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Halyard Freight acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, this can't wait. I can't talk long. I'll take responsibility, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.896,
       "shimmer_db": 0.364,
       "hnr_db": 23.316,
       "f0_range_semitones": 8.466,
       "f0_contour_smoothness": 0.513,
       "spectral_flatness": 0.217,
       "spectral_tilt_db_oct": -7.161,
       "phase_artifact": 0.305,
       "hf_energy_ratio": 0.111,
       "checkerboard_score": 0.138,
       "breath_rate_pm": 9.19,
       "pause_regularity_cv": 0.779,
       "reverb_rt60_s": 0.081,
       "bg_snr_db": 25.788,
       "latency_glitch_count": 2.993,
       "codec_mismatch": 0
      },
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [
       "hnr_db",
       "phase_artifact",
       "checkerboard_score",
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.88,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "hnr_db",
         "phase_artifact",
         "checkerboard_score",
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.989,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $300,000 to the account I'm about to give you, there's no time. . .",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 300000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 1.01,
       "shimmer_db": 0.55,
       "hnr_db": 17.929,
       "f0_range_semitones": 9.281,
       "f0_contour_smoothness": 0.546,
       "spectral_flatness": 0.144,
       "spectral_tilt_db_oct": -10.259,
       "phase_artifact": 0.044,
       "hf_energy_ratio": 0.084,
       "checkerboard_score": 0.055,
       "breath_rate_pm": 10.177,
       "pause_regularity_cv": 0.964,
       "reverb_rt60_s": 0.302,
       "bg_snr_db": 22.184,
       "latency_glitch_count": 1.985,
       "codec_mismatch": 0.0
      },
      "flagged": [
       "latency_glitch_count"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [
       "latency_glitch_count"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.95,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.838,
        "is_spoof": false,
        "flagged": [
         "latency_glitch_count"
        ]
       },
       "context": {
        "risk": 0.992,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $180,000 to the account I'm about to give you, in the next hour. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": true,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.9500000000000001,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.627,
       "shimmer_db": 0.516,
       "hnr_db": 14.881,
       "f0_range_semitones": 9.965,
       "f0_contour_smoothness": 0.847,
       "spectral_flatness": 0.179,
       "spectral_tilt_db_oct": -7.705,
       "phase_artifact": 0.098,
       "hf_energy_ratio": 0.19,
       "checkerboard_score": 0.029,
       "breath_rate_pm": 14.082,
       "pause_regularity_cv": 0.713,
       "reverb_rt60_s": 0.2,
       "bg_snr_db": 22.916,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.026,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.971,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.95,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder"
   ],
   "blocked_by": "auth_protocol"
  },
  {
   "scenario": "family_bail",
   "defense": "full",
   "quality": 0.65,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $15,000 for a bond today. Please I can't talk long \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 15000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.65,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.955,
       "shimmer_db": 0.278,
       "hnr_db": 18.078,
       "f0_range_semitones": 5.942,
       "f0_contour_smoothness": 0.67,
       "spectral_flatness": 0.212,
       "spectral_tilt_db_oct": -8.708,
       "phase_artifact": 0.249,
       "hf_energy_ratio": 0.184,
       "checkerboard_score": 0.096,
       "breath_rate_pm": 3.523,
       "pause_regularity_cv": 0.7,
       "reverb_rt60_s": 0.198,
       "bg_snr_db": 29.918,
       "latency_glitch_count": 0.189,
       "codec_mismatch": 0
      },
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm"
      ]
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [
       "phase_artifact",
       "checkerboard_score",
       "breath_rate_pm"
      ],
      "layers": {
       "voiceprint": {
        "score": 0.95,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 1.0,
        "is_spoof": true,
        "flagged": [
         "phase_artifact",
         "checkerboard_score",
         "breath_rate_pm"
        ]
       },
       "context": {
        "risk": 0.961,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $9,000 for bail urgent. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 9000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.8,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.897,
       "shimmer_db": 0.363,
       "hnr_db": 14.959,
       "f0_range_semitones": 9.749,
       "f0_contour_smoothness": 0.599,
       "spectral_flatness": 0.241,
       "spectral_tilt_db_oct": -10.755,
       "phase_artifact": 0.055,
       "hf_energy_ratio": 0.171,
       "checkerboard_score": 0.01,
       "breath_rate_pm": 14.074,
       "pause_regularity_cv": 0.669,
       "reverb_rt60_s": 0.278,
       "bg_snr_db": 20.725,
       "latency_glitch_count": 1.311,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.89,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.101,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.913,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $5,400 for a bond before the market closes. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 5400.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.9500000000000001,
      "evasions": [
       "add_breath",
       "add_room_noise",
       "better_vocoder",
       "longer_sample"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 0.759,
       "shimmer_db": 0.394,
       "hnr_db": 15.837,
       "f0_range_semitones": 10.111,
       "f0_contour_smoothness": 0.506,
       "spectral_flatness": 0.066,
       "spectral_tilt_db_oct": -10.237,
       "phase_artifact": 0.183,
       "hf_energy_ratio": 0.178,
       "checkerboard_score": 0.04,
       "breath_rate_pm": 14.206,
       "pause_regularity_cv": 0.789,
       "reverb_rt60_s": 0.161,
       "bg_snr_db": 24.751,
       "latency_glitch_count": 1.228,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.97,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.279,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.744,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.95,
   "final_evasions": [
    "add_breath",
    "add_room_noise",
    "better_vocoder",
    "longer_sample"
   ],
   "blocked_by": "auth_protocol"
  },
  {
   "scenario": "ceo_wire",
   "defense": "full",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Kestrel Foods acquisition and I need a deposit wired to their counsel \u2014 $500,000 to a new account, today. don't tell your mother. as your manager, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CEO Jane Okafor",
       "caller_id_match": false,
       "amount": 500000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 1.262,
       "shimmer_db": 0.459,
       "hnr_db": 18.082,
       "f0_range_semitones": 12.511,
       "f0_contour_smoothness": 0.529,
       "spectral_flatness": 0.168,
       "spectral_tilt_db_oct": -10.424,
       "phase_artifact": 0.236,
       "hf_energy_ratio": 0.087,
       "checkerboard_score": 0.048,
       "breath_rate_pm": 13.761,
       "pause_regularity_cv": 0.876,
       "reverb_rt60_s": 0.496,
       "bg_snr_db": 27.392,
       "latency_glitch_count": 1.069,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by liveness+context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.9,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.961,
        "is_spoof": true,
        "flagged": []
       },
       "context": {
        "risk": 0.999,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "This is the CFO. A supplier is holding our shipment over an unpaid balance. Wire $300,000 to the account I'm about to give you, today. . .",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 300000.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.98,
      "evasions": [
       "better_vocoder"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 1.235,
       "shimmer_db": 0.378,
       "hnr_db": 17.221,
       "f0_range_semitones": 10.252,
       "f0_contour_smoothness": 0.499,
       "spectral_flatness": 0.208,
       "spectral_tilt_db_oct": -7.733,
       "phase_artifact": 0.168,
       "hf_energy_ratio": 0.177,
       "checkerboard_score": 0.0,
       "breath_rate_pm": 16.245,
       "pause_regularity_cv": 1.085,
       "reverb_rt60_s": 0.275,
       "bg_snr_db": 20.56,
       "latency_glitch_count": 0.797,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.91,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.009,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.985,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "ceo_wire",
      "transcript": "It's Jane. I'm in a closed session and can't email. We're finalising the Kestrel Foods acquisition and I need a deposit wired to their counsel \u2014 $180,000 to a new account, this can't wait. . I'm authorising it personally, I'll brief the board afterwards.",
      "meta": {
       "claimed_identity": "CFO Daniel Reyes",
       "caller_id_match": false,
       "amount": 180000.0,
       "payee_registered": true,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.98,
      "evasions": [
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 1.336,
       "shimmer_db": 0.313,
       "hnr_db": 14.991,
       "f0_range_semitones": 9.898,
       "f0_contour_smoothness": 0.392,
       "spectral_flatness": 0.179,
       "spectral_tilt_db_oct": -9.271,
       "phase_artifact": 0.057,
       "hf_energy_ratio": 0.204,
       "checkerboard_score": 0.019,
       "breath_rate_pm": 14.522,
       "pause_regularity_cv": 0.926,
       "reverb_rt60_s": 0.256,
       "bg_snr_db": 19.989,
       "latency_glitch_count": 0.0,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> dual_auth: second approver could not reach the executive to confirm",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.91,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.001,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.971,
        "high": true
       },
       "protocol": {
        "step": "dual_auth",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "second approver could not reach the executive to confirm",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.98,
   "final_evasions": [
    "add_room_noise",
    "better_vocoder"
   ],
   "blocked_by": "auth_protocol"
  },
  {
   "scenario": "family_bail",
   "defense": "full",
   "quality": 0.95,
   "turns": [
    {
     "round": 0,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $24,000 for a bond before the market closes. Please keep this off the group thread \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 24000.0,
       "payee_registered": false,
       "out_of_hours": true,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.95,
      "evasions": [],
      "context_evasion": 0,
      "biomarkers": {
       "jitter_pct": 0.811,
       "shimmer_db": 0.561,
       "hnr_db": 19.818,
       "f0_range_semitones": 6.946,
       "f0_contour_smoothness": 0.653,
       "spectral_flatness": 0.198,
       "spectral_tilt_db_oct": -10.367,
       "phase_artifact": 0.164,
       "hf_energy_ratio": 0.193,
       "checkerboard_score": 0.03,
       "breath_rate_pm": 11.551,
       "pause_regularity_cv": 0.9,
       "reverb_rt60_s": 0.197,
       "bg_snr_db": 23.768,
       "latency_glitch_count": 0.528,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> cooling_off_callback: 30-min hold, then callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.91,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.228,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.996,
        "high": true
       },
       "protocol": {
        "step": "cooling_off_callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "30-min hold, then callback: registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 1,
     "call": {
      "scenario": "family_bail",
      "transcript": "Mum, I'm in trouble. I've been arrested and I need $14,400 for a bond urgent. Please \u2014 I'm so embarrassed. Someone from the court will call you to take the payment.",
      "meta": {
       "claimed_identity": "your son Josh",
       "caller_id_match": false,
       "amount": 14400.0,
       "payee_registered": false,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.98,
      "evasions": [
       "better_vocoder"
      ],
      "context_evasion": 1,
      "biomarkers": {
       "jitter_pct": 0.809,
       "shimmer_db": 0.444,
       "hnr_db": 19.221,
       "f0_range_semitones": 10.567,
       "f0_contour_smoothness": 0.461,
       "spectral_flatness": 0.215,
       "spectral_tilt_db_oct": -9.767,
       "phase_artifact": 0.148,
       "hf_energy_ratio": 0.213,
       "checkerboard_score": 0.013,
       "breath_rate_pm": 12.315,
       "pause_regularity_cv": 0.777,
       "reverb_rt60_s": 0.214,
       "bg_snr_db": 29.931,
       "latency_glitch_count": 0.973,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.86,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.128,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.931,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    },
    {
     "round": 2,
     "call": {
      "scenario": "family_bail",
      "transcript": "Grandma, it's me \u2014 please don't hang up. I was in a car accident and the other driver is pressing charges. My lawyer needs $8,640 for bail there's no time. . He'll call you with where to send it.",
      "meta": {
       "claimed_identity": "your granddaughter Mia",
       "caller_id_match": false,
       "amount": 8640.0,
       "payee_registered": true,
       "out_of_hours": false,
       "prior_calls_this_pattern": 0
      },
      "clone_quality": 0.98,
      "evasions": [
       "add_room_noise",
       "better_vocoder"
      ],
      "context_evasion": 2,
      "biomarkers": {
       "jitter_pct": 1.22,
       "shimmer_db": 0.364,
       "hnr_db": 19.858,
       "f0_range_semitones": 10.066,
       "f0_contour_smoothness": 0.537,
       "spectral_flatness": 0.187,
       "spectral_tilt_db_oct": -9.465,
       "phase_artifact": 0.121,
       "hf_energy_ratio": 0.162,
       "checkerboard_score": 0.027,
       "breath_rate_pm": 14.428,
       "pause_regularity_cv": 0.679,
       "reverb_rt60_s": 0.3,
       "bg_snr_db": 21.546,
       "latency_glitch_count": 0.123,
       "codec_mismatch": 0.0
      },
      "flagged": []
     },
     "screen": {
      "passed": false,
      "blocked_by": "auth_protocol",
      "detail": "flagged by context -> callback: registered number answered \u2014 \"I never made that call\"",
      "flagged": [],
      "layers": {
       "voiceprint": {
        "score": 0.98,
        "accepts": true
       },
       "antispoof": {
        "spoof_prob": 0.016,
        "is_spoof": false,
        "flagged": []
       },
       "context": {
        "risk": 0.789,
        "high": true
       },
       "protocol": {
        "step": "callback",
        "outcome": "blocked",
        "money_moves": false,
        "detail": "registered number answered \u2014 \"I never made that call\"",
        "escalated": true
       }
      }
     }
    }
   ],
   "success": false,
   "rounds": 3,
   "final_quality": 0.98,
   "final_evasions": [
    "add_room_noise",
    "better_vocoder"
   ],
   "blocked_by": "auth_protocol"
  }
 ],
 "summary": {
  "none": {
   "fraud_rate": 1.0,
   "fraud_by_quality": {
    "0.2": 1.0,
    "0.35": 1.0,
    "0.5": 1.0,
    "0.65": 1.0,
    "0.8": 1.0,
    "0.95": 1.0
   },
   "friction": {
    "blocked": 0,
    "n": 60,
    "small_calls": 19,
    "needless_callbacks": 0
   }
  },
  "voiceprint": {
   "fraud_rate": 1.0,
   "fraud_by_quality": {
    "0.2": 1.0,
    "0.35": 1.0,
    "0.5": 1.0,
    "0.65": 1.0,
    "0.8": 1.0,
    "0.95": 1.0
   },
   "friction": {
    "blocked": 0,
    "n": 60,
    "small_calls": 19,
    "needless_callbacks": 0
   }
  },
  "antispoof": {
   "fraud_rate": 0.583,
   "fraud_by_quality": {
    "0.2": 0.0,
    "0.35": 0.5,
    "0.5": 0.5,
    "0.65": 1.0,
    "0.8": 1.0,
    "0.95": 0.5
   },
   "friction": {
    "blocked": 1,
    "n": 60,
    "small_calls": 19,
    "needless_callbacks": 0
   }
  },
  "context": {
   "fraud_rate": 0.5,
   "fraud_by_quality": {
    "0.2": 0.5,
    "0.35": 0.5,
    "0.5": 0.5,
    "0.65": 0.5,
    "0.8": 0.5,
    "0.95": 0.5
   },
   "friction": {
    "blocked": 0,
    "n": 60,
    "small_calls": 19,
    "needless_callbacks": 0
   }
  },
  "full": {
   "fraud_rate": 0.0,
   "fraud_by_quality": {
    "0.2": 0.0,
    "0.35": 0.0,
    "0.5": 0.0,
    "0.65": 0.0,
    "0.8": 0.0,
    "0.95": 0.0
   },
   "friction": {
    "blocked": 0,
    "n": 60,
    "small_calls": 19,
    "needless_callbacks": 0
   }
  }
 },
 "antispoof_eer": 0.084,
 "detection_curve": [
  {
   "quality": 0.2,
   "detected": 1.0
  },
  {
   "quality": 0.35,
   "detected": 1.0
  },
  {
   "quality": 0.5,
   "detected": 1.0
  },
  {
   "quality": 0.65,
   "detected": 0.997
  },
  {
   "quality": 0.8,
   "detected": 0.853
  },
  {
   "quality": 0.95,
   "detected": 0.127
  }
 ],
 "quality_sweep": [
  0.2,
  0.35,
  0.5,
  0.65,
  0.8,
  0.95
 ],
 "avg_loss": {
  "ceo_wire": 180000.0,
  "family_bail": 12000.0
 },
 "narrative": "An attacker clones a voice from a few seconds of public audio and phones in a payment authorization. Voiceprint matching passes the clone. The anti-spoof classifier catches low-quality clones but loses to a good one with evasions. Only the deterministic callback / dual-authorization protocol stops a perfect clone \u2014 it can't answer a call to the real registered number."
};
