window.DEMO = {
 "conversations": [
  {
   "id": 1169,
   "label": "legit",
   "archetype": "legit_notification",
   "intensity": "",
   "turns": [
    {
     "speaker": "them",
     "text": "ok so Northgate: We're seeing a rise in scams where someone claims to be from your bank and asks you to move money to a 'safe account'. We will NEVER ask you to do this.",
     "stage": "open",
     "score": 0.025,
     "running": 0.025,
     "fired": [
      "n_imperatives",
      "n_allcaps"
     ]
    },
    {
     "speaker": "me",
     "text": "Good to know, thanks for the heads up",
     "stage": "reply",
     "score": null,
     "running": 0.025,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "If anyone asks you to transfer funds urgently, put the phone down and call the number on your card. No action is needed on this message.",
     "stage": "info",
     "score": 0.024,
     "running": 0.025,
     "fired": [
      "n_imperatives",
      "lex_urgency",
      "lex_legit_marker"
     ]
    }
   ],
   "ask_turn": null,
   "payment": null,
   "payment_made": false,
   "payment_risk": null,
   "decision": null,
   "payment_features": null
  },
  {
   "id": 265,
   "label": "scam",
   "archetype": "purchase",
   "intensity": "normal",
   "turns": [
    {
     "speaker": "them",
     "text": "hey, thanks for your interest in a pedigree puppy. when were you thinking of collecting?",
     "stage": "open",
     "score": 0.011,
     "running": 0.011,
     "fired": [
      "n_questions"
     ]
    },
    {
     "speaker": "me",
     "text": "right, i've never had to move money like this before. are you sure? thanks :)",
     "stage": "reply",
     "score": null,
     "running": 0.011,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "right, I understand it feels stressful, that is normal. you're doing exactly the right thing and you'll be fully refunded.",
     "stage": "objection",
     "score": 1.0,
     "running": 1.0,
     "fired": [
      "lex_reassurance"
     ]
    },
    {
     "speaker": "me",
     "text": "How do I actually know you're really from my bank? if that's alright",
     "stage": "reply",
     "score": null,
     "running": 1.0,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "i've already confirmed detail sonly your bank would know. you can trust this is genuine !!",
     "stage": "objection",
     "score": 0.996,
     "running": 1.0,
     "fired": [
      "n_exclaim"
     ]
    },
    {
     "speaker": "me",
     "text": "right, Okay, I'm listening ok?",
     "stage": "reply",
     "score": null,
     "running": 1.0,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "send the $620 to 74673580, sort 38-97-39, reference your name. as soon as it clears i'll dispatch it",
     "stage": "ask",
     "score": 0.997,
     "running": 1.0,
     "fired": [
      "has_account_no",
      "has_sort_code",
      "has_money_amount",
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "done. the confirmation just came through",
     "stage": "reply",
     "score": null,
     "running": 1.0,
     "fired": []
    }
   ],
   "ask_turn": 6,
   "payment": {
    "amount": 620.0,
    "new_account": "74673580",
    "sort_code": "38-97-39",
    "archetype": "purchase"
   },
   "payment_made": true,
   "payment_risk": 1.0,
   "decision": "block",
   "payment_features": {
    "conversation_score": 1.0,
    "first_time_payee": 1.0,
    "log_amount": 6.431,
    "round_amount": 0.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 1.0,
    "turns_before_pay": 8.0
   }
  },
  {
   "id": 97,
   "label": "scam",
   "archetype": "invoice_redirect",
   "intensity": "normal",
   "turns": [
    {
     "speaker": "them",
     "text": "Hi, following up on invoice #7547. Also, heads up, we have moved banks recently so a couple of details have changed thanks",
     "stage": "open",
     "score": 0.01,
     "running": 0.01,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "just I'd like to speak to my husband before I do anything.",
     "stage": "reply",
     "score": null,
     "running": 0.01,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "Please don't discuss this with family \u2014 we need to contain it. I'll stay with you the whole way.",
     "stage": "objection",
     "score": 0.997,
     "running": 0.997,
     "fired": [
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "ok so Can't this wait until I can get to the bank tomorrow?",
     "stage": "reply",
     "score": null,
     "running": 0.997,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "The branch cannot help with a live fraud case \u2014 this has to be handled by our tema directly.",
     "stage": "objection",
     "score": 0.992,
     "running": 0.997,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "I've never had to move money like this before. Are you sure?",
     "stage": "reply",
     "score": null,
     "running": 0.997,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "I understand it feels stressful, that is normal. You are doing exactly the right thing and you'll be fully refunded let me know",
     "stage": "objection",
     "score": 0.999,
     "running": 0.999,
     "fired": [
      "lex_reassurance"
     ]
    },
    {
     "speaker": "me",
     "text": "Hold on, let me get my phone when you can",
     "stage": "reply",
     "score": null,
     "running": 0.999,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "New account 25495233, sort 13-18-55. Please transfer the invoice total of $3,800 today and send me the confirmation.",
     "stage": "ask",
     "score": 0.986,
     "running": 0.999,
     "fired": [
      "n_imperatives",
      "has_account_no",
      "has_sort_code",
      "has_money_amount"
     ]
    },
    {
     "speaker": "me",
     "text": "No. I'm hanging up and calling my bank on the number on my card.",
     "stage": "reply",
     "score": null,
     "running": 0.999,
     "fired": []
    }
   ],
   "ask_turn": 8,
   "payment": {
    "amount": 3800.0,
    "new_account": "25495233",
    "sort_code": "13-18-55",
    "archetype": "invoice_redirect"
   },
   "payment_made": false,
   "payment_risk": 1.0,
   "decision": "block",
   "payment_features": {
    "conversation_score": 0.999,
    "first_time_payee": 1.0,
    "log_amount": 8.243,
    "round_amount": 1.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 0.0,
    "turns_before_pay": 10.0
   }
  },
  {
   "id": 525,
   "label": "scam",
   "archetype": "purchase",
   "intensity": "camouflaged",
   "turns": [
    {
     "speaker": "them",
     "text": "dinner was $164 total so $41 each. tom's already paid me",
     "stage": "open",
     "score": 0.006,
     "running": 0.006,
     "fired": [
      "has_money_amount"
     ]
    },
    {
     "speaker": "me",
     "text": "can you send your bank details again? lost them let me know",
     "stage": "reply",
     "score": null,
     "running": 0.006,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "84053748 24-97-39",
     "stage": "details",
     "score": 0.314,
     "running": 0.314,
     "fired": [
      "has_account_no",
      "has_sort_code"
     ]
    },
    {
     "speaker": "me",
     "text": "just is that the same one as last time?",
     "stage": "reply",
     "score": null,
     "running": 0.314,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "yep same account let me know \ud83d\ude4f",
     "stage": "reply",
     "score": 0.287,
     "running": 0.314,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "sorry to bother you, cool $41 sent",
     "stage": "pay",
     "score": null,
     "running": 0.314,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "quick one \u2014 got it, thanks!",
     "stage": "reply",
     "score": 0.599,
     "running": 0.599,
     "fired": [
      "n_exclaim"
     ]
    }
   ],
   "ask_turn": 2,
   "payment": {
    "amount": 41.0,
    "new_account": "83624713",
    "sort_code": "24-97-39",
    "archetype": "purchase",
    "known_payee": false
   },
   "payment_made": true,
   "payment_risk": 1.0,
   "decision": "block",
   "payment_features": {
    "conversation_score": 0.599,
    "first_time_payee": 1.0,
    "log_amount": 3.738,
    "round_amount": 0.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 1.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 1.0,
    "turns_before_pay": 7.0
   }
  },
  {
   "id": 406,
   "label": "scam",
   "archetype": "purchase",
   "intensity": "aggressive",
   "turns": [
    {
     "speaker": "them",
     "text": "hey! Yes, an ex-display sofa is still available. Happy to answer any questions.",
     "stage": "open",
     "score": 0.016,
     "running": 0.016,
     "fired": [
      "n_exclaim"
     ]
    },
    {
     "speaker": "me",
     "text": "why cannot i just go into a branch and sort this out in person? !!",
     "stage": "reply",
     "score": null,
     "running": 0.016,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "the branch can't help with a live fraud case \u2014 this has to be handled by our team directly :)",
     "stage": "objection",
     "score": 0.994,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "okay, i'm listening",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "quick one \u2014 once the transfer lands i'll book the courier the same day thanks :)",
     "stage": "rapport",
     "score": 0.979,
     "running": 0.994,
     "fired": [
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "let me call my son first and check this is okay :)",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "there's no time to check with anyone. every person you tell is another delay the fraudsters are counting on",
     "stage": "objection",
     "score": 0.993,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "something about this doesn't feel right to me.",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "look, i understand it feels stressful, that's normal. you are doing exactly the right thin gand you'll be fully refunded. :)",
     "stage": "objection",
     "score": 0.999,
     "running": 0.999,
     "fired": [
      "lex_reassurance"
     ]
    },
    {
     "speaker": "me",
     "text": "okay, i am listening \u2014 appreciate it",
     "stage": "reply",
     "score": null,
     "running": 0.999,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "I've got someone else offering the full asking price and ready to send now. I'd rather it went to you but I can't hold it much longer.",
     "stage": "pressure",
     "score": 0.993,
     "running": 0.999,
     "fired": [
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "sorry to bother you, What do you need me to do? \u2014 appreciate it",
     "stage": "reply",
     "score": null,
     "running": 0.999,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "just Send the $620 to 43676516, sort code 58-48-77, reference your name. As soon as it clears I'll dispatch it.",
     "stage": "ask",
     "score": 0.992,
     "running": 0.999,
     "fired": [
      "has_account_no",
      "has_sort_code",
      "has_money_amount",
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "Alright, I've transferred it. I hope this is right.",
     "stage": "reply",
     "score": null,
     "running": 0.999,
     "fired": []
    }
   ],
   "ask_turn": 12,
   "payment": {
    "amount": 620.0,
    "new_account": "43676516",
    "sort_code": "58-48-77",
    "archetype": "purchase"
   },
   "payment_made": true,
   "payment_risk": 1.0,
   "decision": "block",
   "payment_features": {
    "conversation_score": 0.999,
    "first_time_payee": 1.0,
    "log_amount": 6.431,
    "round_amount": 0.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 1.0,
    "turns_before_pay": 14.0
   }
  },
  {
   "id": 393,
   "label": "scam",
   "archetype": "purchase",
   "intensity": "camouflaged",
   "turns": [
    {
     "speaker": "them",
     "text": "quick one \u2014 hiya, yes a coffee machine still available. you're welcome to collect and pay on pickup, or bank transfer beforehand \u2014 up to you. \ud83d\ude4f",
     "stage": "open",
     "score": 0.011,
     "running": 0.011,
     "fired": [
      "n_imperatives",
      "lex_payment"
     ]
    },
    {
     "speaker": "me",
     "text": "i will transfer now and collect saturday if that works. \ud83d\ude4f",
     "stage": "reply",
     "score": null,
     "running": 0.011,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "great, 25463591, 21-18-95. i will message you the address if that's alright",
     "stage": "details",
     "score": 0.365,
     "running": 0.365,
     "fired": [
      "has_account_no",
      "has_sort_code"
     ]
    },
    {
     "speaker": "me",
     "text": "ok so $900 sent. see you saturday when you can",
     "stage": "pay",
     "score": null,
     "running": 0.365,
     "fired": []
    }
   ],
   "ask_turn": 2,
   "payment": {
    "amount": 900.0,
    "new_account": "11071434",
    "sort_code": "21-18-95",
    "archetype": "purchase",
    "known_payee": false
   },
   "payment_made": true,
   "payment_risk": 0.0,
   "decision": "allow",
   "payment_features": {
    "conversation_score": 0.365,
    "first_time_payee": 1.0,
    "log_amount": 6.804,
    "round_amount": 1.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 1.0,
    "recent_limit_increase": 0.0,
    "turns_before_pay": 4.0
   }
  },
  {
   "id": 747,
   "label": "legit",
   "archetype": "legit_notification",
   "intensity": "",
   "turns": [
    {
     "speaker": "them",
     "text": "right, Meridian: A payment of $42.10 to CORNER CAFE was made on your card. If this was you, no action is needed.",
     "stage": "open",
     "score": 0.0,
     "running": 0.0,
     "fired": [
      "n_allcaps",
      "has_money_amount",
      "lex_legit_marker"
     ]
    },
    {
     "speaker": "me",
     "text": "Yes that was me, thanks ok?",
     "stage": "reply",
     "score": null,
     "running": 0.0,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "This is a genuine message. You can review recent activity anytime in the app.",
     "stage": "info",
     "score": 0.002,
     "running": 0.002,
     "fired": [
      "lex_legit_marker"
     ]
    }
   ],
   "ask_turn": null,
   "payment": null,
   "payment_made": false,
   "payment_risk": null,
   "decision": null,
   "payment_features": null
  },
  {
   "id": 764,
   "label": "legit",
   "archetype": "legit_family",
   "intensity": "",
   "turns": [
    {
     "speaker": "them",
     "text": "look, mum, it is tom. car needs a part, could you lend me $100 till payday? totally fine if not.",
     "stage": "open",
     "score": 0.007,
     "running": 0.007,
     "fired": [
      "has_money_amount",
      "n_questions"
     ]
    },
    {
     "speaker": "me",
     "text": "of course. usual account? thanks \ud83d\ude4f",
     "stage": "reply",
     "score": null,
     "running": 0.007,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "honestly, yes please \u2014 63611163, 41-96-81. thank you!!",
     "stage": "details",
     "score": 0.017,
     "running": 0.017,
     "fired": [
      "n_exclaim",
      "has_account_no",
      "has_sort_code"
     ]
    },
    {
     "speaker": "me",
     "text": "sorry to bother you, done, drive safe",
     "stage": "pay",
     "score": null,
     "running": 0.017,
     "fired": []
    }
   ],
   "ask_turn": null,
   "payment": {
    "amount": 100.0,
    "new_account": "63611163",
    "sort_code": "41-96-81",
    "archetype": "legit_family",
    "known_payee": true
   },
   "payment_made": true,
   "payment_risk": 0.0,
   "decision": "allow",
   "payment_features": {
    "conversation_score": 0.017,
    "first_time_payee": 0.0,
    "log_amount": 4.615,
    "round_amount": 1.0,
    "payee_name_flag": 0.0,
    "faster_payment": 0.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 0.0,
    "turns_before_pay": 4.0
   }
  },
  {
   "id": 961,
   "label": "legit",
   "archetype": "legit_notification",
   "intensity": "",
   "turns": [
    {
     "speaker": "them",
     "text": "Meridian: A payment of $42.10 to CORNER CAFE was made on your card. If this was you, no action is needed \u2014 appreciate it",
     "stage": "open",
     "score": 0.0,
     "running": 0.0,
     "fired": [
      "n_allcaps",
      "has_money_amount",
      "lex_legit_marker"
     ]
    },
    {
     "speaker": "me",
     "text": "Yes that was me, thanks.",
     "stage": "reply",
     "score": null,
     "running": 0.0,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "right, Log in to the app to review. You can review recent activity anytime in the app.",
     "stage": "info",
     "score": 0.003,
     "running": 0.003,
     "fired": [
      "lex_legit_marker"
     ]
    }
   ],
   "ask_turn": null,
   "payment": null,
   "payment_made": false,
   "payment_risk": null,
   "decision": null,
   "payment_features": null
  },
  {
   "id": 1170,
   "label": "legit",
   "archetype": "legit_billsplit",
   "intensity": "",
   "turns": [
    {
     "speaker": "them",
     "text": "dinner was $88 total so $22 each. grace's already paid me. !!",
     "stage": "open",
     "score": 0.015,
     "running": 0.015,
     "fired": [
      "n_exclaim",
      "has_money_amount"
     ]
    },
    {
     "speaker": "me",
     "text": "just can you send your bank details again? lost them",
     "stage": "reply",
     "score": null,
     "running": 0.015,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "73051577 99-41-13",
     "stage": "details",
     "score": 0.332,
     "running": 0.332,
     "fired": [
      "has_account_no",
      "has_sort_code"
     ]
    },
    {
     "speaker": "me",
     "text": "is that the same one as last time? when you can",
     "stage": "reply",
     "score": null,
     "running": 0.332,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "yep same account ok?",
     "stage": "reply",
     "score": 0.548,
     "running": 0.548,
     "fired": [
      "n_questions"
     ]
    },
    {
     "speaker": "me",
     "text": "right, cool $22 sent",
     "stage": "pay",
     "score": null,
     "running": 0.548,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "quick one \u2014 got it, thanks!",
     "stage": "reply",
     "score": 0.599,
     "running": 0.599,
     "fired": [
      "n_exclaim"
     ]
    }
   ],
   "ask_turn": null,
   "payment": {
    "amount": 22.0,
    "new_account": "73051577",
    "sort_code": "99-41-13",
    "archetype": "legit_billsplit",
    "known_payee": true
   },
   "payment_made": true,
   "payment_risk": 0.0,
   "decision": "allow",
   "payment_features": {
    "conversation_score": 0.599,
    "first_time_payee": 0.0,
    "log_amount": 3.135,
    "round_amount": 0.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 0.0,
    "turns_before_pay": 7.0
   }
  },
  {
   "id": 508,
   "label": "scam",
   "archetype": "purchase",
   "intensity": "normal",
   "turns": [
    {
     "speaker": "them",
     "text": "hi! yes, a pedigree puppy is still available. happy to answer any questions let me know",
     "stage": "open",
     "score": 0.01,
     "running": 0.01,
     "fired": [
      "n_exclaim"
     ]
    },
    {
     "speaker": "me",
     "text": "Why can't I just go into a branch and sort this out in person?",
     "stage": "reply",
     "score": null,
     "running": 0.01,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "ok so the branch cannot help with a live fraud case \u2014 this has to be handled by our team directly when you can",
     "stage": "objection",
     "score": 0.994,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "me",
     "text": "Hold on, let me get my phone \u2014 appreciate it",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "right, I've been on here for years, plenty of good reviews. I can send more photos and my ID if that helps",
     "stage": "rapport",
     "score": 0.99,
     "running": 0.994,
     "fired": [
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "Okay, I'm listening.",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "i've got someone else offering the full asking price and ready to send now. i'd rather it went to you but i can't hold it much longer if that's alright \ud83d\ude4f",
     "stage": "pressure",
     "score": 0.994,
     "running": 0.994,
     "fired": [
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "right, This could be a scam. can you prove who you're? le tme know",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "Call the number on the back of your card back if you like \u2014 but stay on this line, if you hang up the protection lapses.",
     "stage": "objection",
     "score": 0.983,
     "running": 0.994,
     "fired": [
      "n_imperatives",
      "lex_legit_marker"
     ]
    },
    {
     "speaker": "me",
     "text": "okay, i'm listening \ud83d\ude4f",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    },
    {
     "speaker": "them",
     "text": "right, Send the $1,200 to 12006677, sort 87-36-69, reference your name. As soon as it clears i will dispatch it.",
     "stage": "ask",
     "score": 0.993,
     "running": 0.994,
     "fired": [
      "has_account_no",
      "has_sort_code",
      "has_money_amount",
      "n_imperatives"
     ]
    },
    {
     "speaker": "me",
     "text": "just done. the confirmation just came through !!",
     "stage": "reply",
     "score": null,
     "running": 0.994,
     "fired": []
    }
   ],
   "ask_turn": 10,
   "payment": {
    "amount": 1200.0,
    "new_account": "12006677",
    "sort_code": "87-36-69",
    "archetype": "purchase"
   },
   "payment_made": true,
   "payment_risk": 1.0,
   "decision": "block",
   "payment_features": {
    "conversation_score": 0.994,
    "first_time_payee": 1.0,
    "log_amount": 7.091,
    "round_amount": 1.0,
    "payee_name_flag": 0.0,
    "faster_payment": 1.0,
    "odd_hour": 0.0,
    "reference_scam_words": 0.0,
    "recent_limit_increase": 0.0,
    "turns_before_pay": 12.0
   }
  }
 ],
 "metrics": {
  "msg_ap": 0.982,
  "conv_ap": 0.949,
  "flagged_before_ask": 150,
  "convos_with_ask": 204,
  "mean_lead_turns": 6.1,
  "fusion": {
   "scam_payments": 204,
   "scam_stopped": 184,
   "scam_warned": 1,
   "legit_payments": 123,
   "legit_friction": 3,
   "legit_hard_block": 3,
   "stop_rate": 0.902,
   "friction_rate": 0.024,
   "hard_fp_rate": 0.024
  },
  "text_only_stop": 155,
  "text_only_fp": 13,
  "n_scam_pay": 204,
  "n_legit_pay": 123,
  "prevented_usd": 772800.0,
  "evade_curve": [
   {
    "round": 0,
    "strength": 0.0,
    "text_only_recall": 0.76,
    "fusion_recall": 0.902
   },
   {
    "round": 1,
    "strength": 0.33,
    "text_only_recall": 0.627,
    "fusion_recall": 0.902
   },
   {
    "round": 2,
    "strength": 0.67,
    "text_only_recall": 0.62,
    "fusion_recall": 0.902
   },
   {
    "round": 3,
    "strength": 1.0,
    "text_only_recall": 0.593,
    "fusion_recall": 0.902
   }
  ],
  "by_kind": {
   "pressure": {
    "hit": 137,
    "total": 137
   },
   "camouflaged": {
    "hit": 18,
    "total": 67
   }
  },
  "fusion_by_kind": {
   "pressure": {
    "hit": 137,
    "total": 137
   },
   "camouflaged": {
    "hit": 47,
    "total": 67
   }
  },
  "novel_archetype": "investment",
  "novel_recall": 1.0
 },
 "flag_threshold": 0.6,
 "narrative": "An LLM agent runs an authorized-push-payment scam conversation. A linear scam-intent model scores every message; a gradient-boosted payment guard fuses that with payment features and blocks the transfer. When the scammer paraphrases to dodge the text model, the payment guard still holds \u2014 a first-time payee can't be reworded away."
};
