/**
 * Louvre Art Master - Artwork Dataset
 * 
 * 10 Masterpieces from the Louvre Museum
 * Each artwork includes: id, title, artist, period, style, year, type, and image URL
 */

const ARTWORKS = [
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    period: 'Renaissance (1503-1519)',
    style: 'High Renaissance',
    year: 1519,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
  },
  {
    id: 'venus-de-milo',
    title: 'Venus de Milo',
    artist: 'Alexandros of Antioch',
    period: 'Hellenistic (130-100 BC)',
    style: 'Ancient Greek',
    year: -100,
    type: 'sculpture',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Venus_de_Milo_Louvre_Ma399_n4.jpg/440px-Venus_de_Milo_Louvre_Ma399_n4.jpg'
  },
  {
    id: 'winged-victory',
    title: 'Winged Victory of Samothrace',
    artist: 'Unknown',
    period: 'Hellenistic (190 BC)',
    style: 'Ancient Greek',
    year: -190,
    type: 'sculpture',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nike_of_Samothrake_Louvre_Ma2369_n4.jpg/440px-Nike_of_Samothrake_Louvre_Ma2369_n4.jpg'
  },
  {
    id: 'liberty-leading',
    title: 'Liberty Leading the People',
    artist: 'Eugène Delacroix',
    period: 'Romantic (1830)',
    style: 'Romanticism',
    year: 1830,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg'
  },
  {
    id: 'coronation-napoleon',
    title: 'The Coronation of Napoleon',
    artist: 'Jacques-Louis David',
    period: 'Neoclassical (1807)',
    style: 'Neoclassicism',
    year: 1807,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/1920px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg'
  },
  {
    id: 'wedding-at-cana',
    title: 'The Wedding at Cana',
    artist: 'Paolo Veronese',
    period: 'Renaissance (1563)',
    style: 'Venetian Renaissance',
    year: 1563,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Paolo_Veronese_-_The_Wedding_at_Cana_-_WGA24854.jpg/1920px-Paolo_Veronese_-_The_Wedding_at_Cana_-_WGA24854.jpg'
  },
  {
    id: 'raft-of-medusa',
    title: 'The Raft of the Medusa',
    artist: 'Théodore Géricault',
    period: 'Romantic (1819)',
    style: 'Romanticism',
    year: 1819,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg/1920px-JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_%28Museo_del_Louvre%2C_1818-19%29.jpg'
  },
  {
    id: 'the-lacemaker',
    title: 'The Lacemaker',
    artist: 'Johannes Vermeer',
    period: 'Baroque (1669-1670)',
    style: 'Dutch Golden Age',
    year: 1670,
    type: 'painting',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg/440px-Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg'
  },
  {
    id: 'psyche-cupid',
    title: "Psyche Revived by Cupid's Kiss",
    artist: 'Antonio Canova',
    period: 'Neoclassical (1793)',
    style: 'Neoclassicism',
    year: 1793,
    type: 'sculpture',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Psyche_revived_Louvre_MR1777.jpg/440px-Psyche_revived_Louvre_MR1777.jpg'
  },
  {
    id: 'great-sphinx',
    title: 'The Great Sphinx of Tanis',
    artist: 'Unknown',
    period: 'Ancient (2600 BC)',
    style: 'Egyptian',
    year: -2600,
    type: 'sculpture',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Grand_Sphinx_de_Tanis_-_Mus%C3%A9e_du_Louvre_-_A_23_%281%29.jpg/1920px-Grand_Sphinx_de_Tanis_-_Mus%C3%A9e_du_Louvre_-_A_23_%281%29.jpg'
  }
];
