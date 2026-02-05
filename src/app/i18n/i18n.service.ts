import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LanguageCode = 'ro' | 'en' | 'fr' | 'es' | 'de';

const STORAGE_KEY = 'memory-game-language';

const STRINGS: Record<LanguageCode, Record<string, string>> = {
  ro: {
    'app.title': 'Happy Memory Match',
    'app.subtitle': 'Gaseste cartile identice si distreaza-te!',
    'home.start': 'Start joc',
    'home.lastSettings': 'Ultimele setari:',
    'home.settings': 'Setari joc',
    'home.exit': 'Inchidere aplicatie',
    'home.hello': 'Salut!',
    'home.welcome': 'Bine ai venit la joc',
    'home.language': 'Limba',
    'home.player': 'Jucator',
    'home.activePack': 'Pachet activ',
    'home.configurePack': 'Configurare pachet',
    'settings.title': 'Setari joc',
    'settings.close': 'Inchide',
    'settings.save': 'Salveaza',
    'settings.category': 'Categorie',
    'settings.difficulty': 'Dificultate',
    'settings.sound': 'Sunet',
    'settings.music': 'Muzica',
    'settings.matchSize': 'Potrivire',
    'settings.grid': 'Grila',
    'settings.matchCount': '{count} identice',
    'game.back': 'Inapoi la meniu',
    'game.chooseCategory': 'Alege categoria',
    'game.match': 'Potrivire',
    'game.progress': 'Progres',
    'game.winTitle': 'Bravo!',
    'game.winText': 'Ai terminat jocul in {moves} mutari.',
    'game.playAgain': 'Mai vreau!',
    'category.animals': 'Animale',
    'category.letters': 'Litere',
    'category.numbers': 'Cifre',
    'category.hospital': 'Spital',
    'paywall.title': 'Premium',
    'paywall.subtitle': 'Deblocheaza pachete noi si elimina reclamele.',
    'paywall.unlockCategory': 'Deblocheaza',
    'paywall.buy': 'Cumpara',
    'paywall.restore': 'Restaureaza achizitiile',
    'paywall.productLetters': 'Pachet Litere',
    'paywall.productNumbers': 'Pachet Cifre',
    'paywall.productNoAds': 'Fara reclame',
    'paywall.productBundle': 'Toate pachetele'
  },
  en: {
    'app.title': 'Happy Memory Match',
    'app.subtitle': 'Find the matching cards and have fun!',
    'home.start': 'Start game',
    'home.lastSettings': 'Last settings:',
    'home.settings': 'Game settings',
    'home.exit': 'Exit app',
    'home.hello': 'Hi!',
    'home.welcome': 'Welcome to the game',
    'home.language': 'Language',
    'home.player': 'Player',
    'home.activePack': 'Active pack',
    'home.configurePack': 'Configure pack',
    'settings.title': 'Game settings',
    'settings.close': 'Close',
    'settings.save': 'Save',
    'settings.category': 'Category',
    'settings.difficulty': 'Difficulty',
    'settings.sound': 'Sound',
    'settings.music': 'Music',
    'settings.matchSize': 'Matches',
    'settings.grid': 'Grid',
    'settings.matchCount': '{count} matching',
    'game.back': 'Back to menu',
    'game.chooseCategory': 'Choose category',
    'game.match': 'Match',
    'game.progress': 'Progress',
    'game.winTitle': 'Great job!',
    'game.winText': 'You finished the game in {moves} moves.',
    'game.playAgain': 'Play again!',
    'category.animals': 'Animals',
    'category.letters': 'Letters',
    'category.numbers': 'Numbers',
    'category.hospital': 'Hospital',
    'paywall.title': 'Premium',
    'paywall.subtitle': 'Unlock new packs and remove ads.',
    'paywall.unlockCategory': 'Unlock',
    'paywall.buy': 'Buy',
    'paywall.restore': 'Restore purchases',
    'paywall.productLetters': 'Letters Pack',
    'paywall.productNumbers': 'Numbers Pack',
    'paywall.productNoAds': 'No Ads',
    'paywall.productBundle': 'All Packs Bundle'
  },
  fr: {
    'app.title': 'Happy Memory Match',
    'app.subtitle': 'Trouve les cartes identiques et amuse-toi !',
    'home.start': 'Démarrer',
    'home.lastSettings': 'Derniers réglages :',
    'home.settings': 'Paramètres du jeu',
    'home.exit': 'Quitter',
    'home.hello': 'Salut !',
    'home.welcome': 'Bienvenue dans le jeu',
    'home.language': 'Langue',
    'home.player': 'Joueur',
    'home.activePack': 'Pack actif',
    'home.configurePack': 'Configurer pack',
    'settings.title': 'Paramètres du jeu',
    'settings.close': 'Fermer',
    'settings.save': 'Enregistrer',
    'settings.category': 'Catégorie',
    'settings.difficulty': 'Difficulté',
    'settings.sound': 'Son',
    'settings.music': 'Musique',
    'settings.matchSize': 'Association',
    'settings.grid': 'Grille',
    'settings.matchCount': '{count} identiques',
    'game.back': 'Retour au menu',
    'game.chooseCategory': 'Choisir la catégorie',
    'game.match': 'Association',
    'game.progress': 'Progression',
    'game.winTitle': 'Bravo !',
    'game.winText': 'Tu as terminé la partie en {moves} coups.',
    'game.playAgain': 'Rejouer !',
    'category.animals': 'Animaux',
    'category.letters': 'Lettres',
    'category.numbers': 'Chiffres',
    'category.hospital': 'Hopital',
    'paywall.title': 'Premium',
    'paywall.subtitle': 'Debloque de nouveaux packs et retire les pubs.',
    'paywall.unlockCategory': 'Debloquer',
    'paywall.buy': 'Acheter',
    'paywall.restore': 'Restaurer les achats',
    'paywall.productLetters': 'Pack Lettres',
    'paywall.productNumbers': 'Pack Chiffres',
    'paywall.productNoAds': 'Sans pub',
    'paywall.productBundle': 'Pack complet'
  },
  es: {
    'app.title': 'Happy Memory Match',
    'app.subtitle': 'Encuentra las cartas iguales y diviértete.',
    'home.start': 'Empezar',
    'home.lastSettings': 'Últimos ajustes:',
    'home.settings': 'Ajustes del juego',
    'home.exit': 'Salir',
    'home.hello': '¡Hola!',
    'home.welcome': 'Bienvenido al juego',
    'home.language': 'Idioma',
    'home.player': 'Jugador',
    'home.activePack': 'Paquete activo',
    'home.configurePack': 'Configurar paquete',
    'settings.title': 'Ajustes del juego',
    'settings.close': 'Cerrar',
    'settings.save': 'Guardar',
    'settings.category': 'Categoría',
    'settings.difficulty': 'Dificultad',
    'settings.sound': 'Sonido',
    'settings.music': 'Música',
    'settings.matchSize': 'Emparejar',
    'settings.grid': 'Cuadrícula',
    'settings.matchCount': '{count} iguales',
    'game.back': 'Volver al menú',
    'game.chooseCategory': 'Elige la categoría',
    'game.match': 'Parejas',
    'game.progress': 'Progreso',
    'game.winTitle': '¡Bien hecho!',
    'game.winText': 'Terminaste el juego en {moves} movimientos.',
    'game.playAgain': '¡Jugar de nuevo!',
    'category.animals': 'Animales',
    'category.letters': 'Letras',
    'category.numbers': 'Números',
    'category.hospital': 'Hospital',
    'paywall.title': 'Premium',
    'paywall.subtitle': 'Desbloquea nuevos paquetes y quita anuncios.',
    'paywall.unlockCategory': 'Desbloquear',
    'paywall.buy': 'Comprar',
    'paywall.restore': 'Restaurar compras',
    'paywall.productLetters': 'Pack Letras',
    'paywall.productNumbers': 'Pack Números',
    'paywall.productNoAds': 'Sin anuncios',
    'paywall.productBundle': 'Pack completo'
  },
  de: {
    'app.title': 'Happy Memory Match',
    'app.subtitle': 'Finde die gleichen Karten und hab Spaß!',
    'home.start': 'Starten',
    'home.lastSettings': 'Letzte Einstellungen:',
    'home.settings': 'Spieleinstellungen',
    'home.exit': 'Beenden',
    'home.hello': 'Hallo!',
    'home.welcome': 'Willkommen zum Spiel',
    'home.language': 'Sprache',
    'home.player': 'Spieler',
    'home.activePack': 'Aktives Paket',
    'home.configurePack': 'Paket konfigurieren',
    'settings.title': 'Spieleinstellungen',
    'settings.close': 'Schließen',
    'settings.save': 'Speichern',
    'settings.category': 'Kategorie',
    'settings.difficulty': 'Schwierigkeit',
    'settings.sound': 'Ton',
    'settings.music': 'Musik',
    'settings.matchSize': 'Paare',
    'settings.grid': 'Raster',
    'settings.matchCount': '{count} gleiche',
    'game.back': 'Zurück zum Menü',
    'game.chooseCategory': 'Kategorie wählen',
    'game.match': 'Paare',
    'game.progress': 'Fortschritt',
    'game.winTitle': 'Super!',
    'game.winText': 'Du hast das Spiel in {moves} Zügen beendet.',
    'game.playAgain': 'Nochmal spielen!',
    'category.animals': 'Tiere',
    'category.letters': 'Buchstaben',
    'category.numbers': 'Zahlen',
    'category.hospital': 'Krankenhaus',
    'paywall.title': 'Premium',
    'paywall.subtitle': 'Schalte neue Pakete frei und entferne Werbung.',
    'paywall.unlockCategory': 'Freischalten',
    'paywall.buy': 'Kaufen',
    'paywall.restore': 'Kaeufe wiederherstellen',
    'paywall.productLetters': 'Buchstaben Paket',
    'paywall.productNumbers': 'Zahlen Paket',
    'paywall.productNoAds': 'Keine Werbung',
    'paywall.productBundle': 'Komplett Paket'
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly languageSubject = new BehaviorSubject<LanguageCode>('ro');

  readonly language$ = this.languageSubject.asObservable();

  constructor() {
    const stored = this.getStoredLanguage();
    if (stored) {
      this.languageSubject.next(stored);
    }
  }

  get language(): LanguageCode {
    return this.languageSubject.value;
  }

  setLanguage(language: LanguageCode): void {
    this.languageSubject.next(language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dictionary = STRINGS[this.language] ?? STRINGS.ro;
    const template = dictionary[key] ?? STRINGS.ro[key] ?? key;
    if (!params) {
      return template;
    }
    return Object.keys(params).reduce((acc, paramKey) => {
      return acc.replace(`{${paramKey}}`, String(params[paramKey]));
    }, template);
  }

  private getStoredLanguage(): LanguageCode | null {
    const raw = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (!raw) {
      return null;
    }
    if (raw === 'ro' || raw === 'en' || raw === 'fr' || raw === 'es' || raw === 'de') {
      return raw;
    }
    return null;
  }
}
