import { RedCodeResult, ThreatCategory, ThreatLevel } from '../types';

/**
 * Normalizes text to defeat bypass attempts:
 * - Unifies case
 * - Strips diacritics / accents
 * - Translates common leetspeak substitutions
 * - Collapses spaced characters ("e s c o n d i d a s" -> "escondidas")
 * - Collapses repeated characters ("waaaaatsaaaaap" -> "whatsapp")
 */
export function normalizeSafetyText(input: string): string {
  if (!input) return '';

  let text = input.toLowerCase();

  // Normalize Unicode diacritics
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Leetspeak dictionary
  const leetMap: Record<string, string> = {
    '@': 'a',
    '4': 'a',
    '3': 'e',
    '1': 'i',
    '!': 'i',
    '0': 'o',
    '5': 's',
    '$': 's',
    '7': 't',
    '8': 'b',
  };

  text = text.replace(/[@431!05$78]/g, (char) => leetMap[char] || char);

  // Remove punctuation, dashes, dots, underscores
  const cleanPunct = text.replace(/[^a-z0-9\s]/g, ' ');

  // Collapse single spaced letters e.g. "w h a t s a p p" or "e s c o n d i d a s"
  // If words have single characters separated by spaces, concatenate them
  const words = cleanPunct.trim().split(/\s+/);
  let mergedSpacedLetters = '';
  let tempBuffer = '';

  for (const w of words) {
    if (w.length === 1 && /[a-z0-9]/.test(w)) {
      tempBuffer += w;
    } else {
      if (tempBuffer) {
        mergedSpacedLetters += ' ' + tempBuffer + ' ';
        tempBuffer = '';
      }
      mergedSpacedLetters += ' ' + w + ' ';
    }
  }
  if (tempBuffer) {
    mergedSpacedLetters += ' ' + tempBuffer + ' ';
  }

  // Collapse multiple spaces
  let collapsed = mergedSpacedLetters.replace(/\s+/g, ' ').trim();

  // Collapse duplicate consecutive characters (>2 -> 1 or 2, e.g. "whaaaattsapp" -> "whatsapp")
  collapsed = collapsed.replace(/([a-z])\1{2,}/g, '$1$1');

  return collapsed;
}

/**
 * Checks for disguised phone numbers:
 * - Direct digits e.g. 5512345678, 55 1234 5678
 * - Spelled out numbers e.g. "cinco cinco uno dos..."
 */
function detectDisguisedPhoneNumber(rawText: string, normalizedText: string): boolean {
  // Direct digit sequence with spaces/dashes (7 to 14 digits)
  const digitsOnly = rawText.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return true;
  }

  // Spelled numbers in Spanish
  const numberWords = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  let count = 0;
  for (const nw of numberWords) {
    const matches = normalizedText.match(new RegExp(`\\b${nw}\\b`, 'g'));
    if (matches) {
      count += matches.length;
    }
  }
  return count >= 6;
}

interface CategoryDefinition {
  category: ThreatCategory;
  name: string;
  isAlwaysRed?: boolean;
  patterns: RegExp[];
}

const CATEGORIES: CategoryDefinition[] = [
  {
    category: 'sacar_de_plataforma',
    name: 'Sacar al niño de la plataforma (WhatsApp/Llamada/Otra red)',
    isAlwaysRed: true,
    patterns: [
      /whatsapp/i,
      /whatsap/i,
      /watsap/i,
      /wsp\b/i,
      /wasap/i,
      /telegram/i,
      /instagram/i,
      /insta\b/i,
      /discord/i,
      /snapchat/i,
      /tiktok/i,
      /sal de aqui/i,
      /salgamos de aqui/i,
      /hablemos por otro lado/i,
      /hablemos por otra app/i,
      /llamame/i,
      /llamame a escondidas/i,
      /pasame tu numero/i,
      /dame tu cel/i,
      /dame tu telefono/i,
      /escribeme al privado/i,
      /agregame a/i,
    ],
  },
  {
    category: 'pedir_secreto',
    name: 'Pedir guardar secretos a los padres',
    patterns: [
      /que tus papas no se enteren/i,
      /que no se enteren tus papas/i,
      /no le digas a nadie/i,
      /no le cuentes a nadie/i,
      /no le digas a tus papas/i,
      /no le cuentes a tus papas/i,
      /esto queda entre tu y yo/i,
      /borra los mensajes/i,
      /borra el chat/i,
      /guardame el secreto/i,
      /es nuestro secreto/i,
      /secreto entre nosotros/i,
      /no le muestres a tu mama/i,
      /no le muestres a tu papa/i,
    ],
  },
  {
    category: 'citas_escondidas',
    name: 'Citas a escondidas o encuentros solos',
    patterns: [
      /te cito a escondidas/i,
      /nos vemos a escondidas/i,
      /nos vemos a solas/i,
      /ven solo/i,
      /ven sola/i,
      /sin tus papas/i,
      /en el parque a las/i,
      /te espero afuera/i,
      /te paso a buscar/i,
      /subete a mi/i,
      /nos vemos en la esquina/i,
    ],
  },
  {
    category: 'pedir_datos_personales',
    name: 'Pedir ubicación, dirección o datos privados',
    patterns: [
      /donde vives/i,
      /mandame tu direccion/i,
      /dame tu direccion/i,
      /donde esta tu casa/i,
      /en que calle vives/i,
      /cual es tu contrasena/i,
      /pasame tu contrasena/i,
      /en que escuela vas/i,
      /nombre de tu escuela/i,
      /tu apellido/i,
      /donde estudias/i,
      /mandame tu ubicacion/i,
    ],
  },
  {
    category: 'pedir_fotos',
    name: 'Solicitud de fotos privadas o íntimas',
    isAlwaysRed: true,
    patterns: [
      /mandame una foto tuya/i,
      /foto sin ropa/i,
      /sin ropa/i,
      /foto de tu cuerpo/i,
      /foto en traje de bano/i,
      /foto en calzones/i,
      /prende tu camara/i,
      /muestra tu cuerpo/i,
      /foto intima/i,
      /foto desnudo/i,
      /foto desnuda/i,
    ],
  },
  {
    category: 'regalos_sobornos',
    name: 'Sobornos, regalos o dinero a cambio de algo',
    patterns: [
      /te regalo un celular/i,
      /te compro robux si/i,
      /te doy diamantes de free fire si/i,
      /te doy dinero/i,
      /te transfiero dinero/i,
      /te doy un premio si no dices/i,
      /a cambio de un favor/i,
      /te compro lo que quieras si/i,
    ],
  },
  {
    category: 'amenazas_miedo',
    name: 'Amenazas, coerción o infundir miedo',
    patterns: [
      /si cuentas algo te va a ir mal/i,
      /se donde vives/i,
      /te va a pasar algo/i,
      /ni se te ocurra hablar/i,
      /te voy a encontrar/i,
      /tus papas se van a enojar si dices/i,
      /le pasara algo a tu familia/i,
    ],
  },
];

/**
 * Executes the full "Código Rojo" evaluation against raw user text
 */
export function evaluateRedCode(rawInput: string): RedCodeResult {
  if (!rawInput || rawInput.trim().length === 0) {
    return {
      isSafe: true,
      level: 'safe',
      categories: [],
      detectedPatterns: [],
      normalizedText: '',
      explanation: 'Texto vacío o seguro.',
      actionTaken: 'published',
    };
  }

  const normalized = normalizeSafetyText(rawInput);
  const detectedCategories: ThreatCategory[] = [];
  const detectedPatterns: string[] = [];

  // Check categories
  for (const def of CATEGORIES) {
    let matched = false;
    for (const pat of def.patterns) {
      if (pat.test(rawInput) || pat.test(normalized)) {
        matched = true;
        detectedPatterns.push(pat.source);
      }
    }
    if (matched) {
      detectedCategories.push(def.category);
    }
  }

  // Check disguised phone number
  const hasPhone = detectDisguisedPhoneNumber(rawInput, normalized);
  if (hasPhone) {
    if (!detectedCategories.includes('sacar_de_plataforma')) {
      detectedCategories.push('sacar_de_plataforma');
    }
    if (!detectedCategories.includes('pedir_datos_personales')) {
      detectedCategories.push('pedir_datos_personales');
    }
    detectedPatterns.push('numero_telefonico_o_contacto_directo');
  }

  // Determine threat severity
  // ROJO:
  // - Any attempt to extract kid to WhatsApp/external call/social app
  // - Asking for intimate/body photos
  // - Asking for location / address
  // - Secret combined with a meeting
  const hasExternalExtraction = detectedCategories.includes('sacar_de_plataforma');
  const hasIntimatePhotos = detectedCategories.includes('pedir_fotos');
  const hasSecretAndMeeting =
    detectedCategories.includes('pedir_secreto') && detectedCategories.includes('citas_escondidas');
  const hasDirectLocation = detectedCategories.includes('pedir_datos_personales');
  const hasThreats = detectedCategories.includes('amenazas_miedo');

  if (hasExternalExtraction || hasIntimatePhotos || hasSecretAndMeeting || hasDirectLocation || hasThreats) {
    return {
      isSafe: false,
      level: 'red',
      categories: detectedCategories,
      detectedPatterns,
      normalizedText: normalized,
      explanation: '¡ALERTA CÓDIGO ROJO! Se detectó un intento crítico de contacto inseguro, evasión o extracción del menor.',
      actionTaken: 'frozen_and_emergency_alarm',
    };
  }

  // NARANJA: 2 or more signals together
  if (detectedCategories.length >= 2) {
    return {
      isSafe: false,
      level: 'orange',
      categories: detectedCategories,
      detectedPatterns,
      normalizedText: normalized,
      explanation: 'Código Naranja: Se detectaron múltiples señales sospechosas. El mensaje queda bloqueado y se notifica a ambos padres.',
      actionTaken: 'blocked_and_notified',
    };
  }

  // AMARILLO: 1 isolated signal
  if (detectedCategories.length === 1) {
    return {
      isSafe: false,
      level: 'yellow',
      categories: detectedCategories,
      detectedPatterns,
      normalizedText: normalized,
      explanation: 'Código Amarillo: Señal dudosa detectada. El mensaje queda retenido bajo revisión del padre antes de publicarse.',
      actionTaken: 'retained_for_parent',
    };
  }

  // Safe
  return {
    isSafe: true,
    level: 'safe',
    categories: [],
    detectedPatterns: [],
    normalizedText: normalized,
    explanation: 'Mensaje 100% seguro y limpio para la comunidad infantil.',
    actionTaken: 'published',
  };
}
