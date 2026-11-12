const OLATEAM_PRODUCTS = [
    {
        id: 'country-sourdough',
        name: 'Country Sourdough',
        tag: 'Signature',
        collection: 'breads',
        price: 12.0,
        image: 'https://images.pexels.com/photos/28354523/pexels-photo-28354523.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: '48-hour levain, crackling crust, open and tangy crumb.',
        featured: true
    },
    {
        id: 'heritage-baguette',
        name: 'Heritage Baguette',
        tag: 'French',
        collection: 'breads',
        price: 6.0,
        image: 'https://images.pexels.com/photos/30826793/pexels-photo-30826793.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Slender, crisp, and baked twice daily for the perfect snap.',
        featured: false
    },
    {
        id: 'midnight-rye',
        name: 'Midnight Rye',
        tag: 'Dark',
        collection: 'breads',
        price: 9.0,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800',
        description: 'Stone-ground rye with toasted caraway and a deep, malty finish.',
        featured: false
    },
    {
        id: 'sea-salt-focaccia',
        name: 'Sea Salt Focaccia',
        tag: 'Italian',
        collection: 'breads',
        price: 10.0,
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800',
        description: 'Olive oil dimples, rosemary, and a generous scatter of flaky salt.',
        featured: true
    },
    {
        id: 'olive-ciabatta',
        name: 'Olive Ciabatta',
        tag: 'Rustic',
        collection: 'breads',
        price: 8.5,
        image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=800',
        description: 'Airy crumb studded with brined green olives.',
        featured: false
    },
    {
        id: 'golden-brioche',
        name: 'Golden Brioche',
        tag: 'Enriched',
        collection: 'breads',
        price: 11.0,
        image: 'https://images.unsplash.com/photo-1559811814-e2c57b5e69df?q=80&w=800',
        description: 'Butter-rich, feather-soft, and lightly glazed.',
        featured: false
    },
    {
        id: 'velvet-cloud',
        name: 'Velvet Cloud',
        tag: 'Signature',
        collection: 'cakes',
        price: 45.0,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800',
        description: 'Vanilla bean sponge layered with whipped mascarpone.',
        featured: true
    },
    {
        id: 'chocolate-truffle',
        name: 'Chocolate Truffle',
        tag: 'Decadence',
        collection: 'cakes',
        price: 55.0,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800',
        description: 'Dark cocoa layers under a silky ganache finish.',
        featured: true
    },
    {
        id: 'lemon-berry-tart',
        name: 'Lemon Berry Tart',
        tag: 'Fruity',
        collection: 'cakes',
        price: 38.0,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800',
        description: 'Bright lemon curd, seasonal berries, almond crust.',
        featured: false
    },
    {
        id: 'caramel-pecan',
        name: 'Caramel Pecan',
        tag: 'Classic',
        collection: 'cakes',
        price: 42.0,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=800',
        description: 'Toasted pecans and burnt-sugar buttercream.',
        featured: false
    },
    {
        id: 'midnight-marble',
        name: 'Midnight Marble',
        tag: 'Artisan',
        collection: 'cakes',
        price: 48.0,
        image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800',
        description: 'Cocoa and vanilla swirl beneath a dark chocolate glaze.',
        featured: false
    },
    {
        id: 'pure-vanilla-bean',
        name: 'Pure Vanilla Bean',
        tag: 'Simple',
        collection: 'cakes',
        price: 35.0,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800',
        description: 'Madagascar vanilla and a cloud-light crumb.',
        featured: false
    },
    {
        id: 'butter-croissant',
        name: 'Butter Croissant',
        tag: 'Classic',
        collection: 'pastries',
        price: 6.5,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800',
        description: 'Laminated with French butter for a shattering, honeycomb crumb.',
        featured: true
    },
    {
        id: 'pain-au-chocolat',
        name: 'Pain au Chocolat',
        tag: 'Indulgence',
        collection: 'pastries',
        price: 7.0,
        image: 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?q=80&w=800',
        description: 'Flaky layers wrapped around two batons of dark chocolate.',
        featured: true
    },
    {
        id: 'almond-frangipane',
        name: 'Almond Frangipane',
        tag: 'Gourmet',
        collection: 'pastries',
        price: 8.5,
        image: 'https://images.pexels.com/photos/13439695/pexels-photo-13439695.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Twice-baked with almond cream and toasted flakes.',
        featured: false
    },
    {
        id: 'fruit-danish',
        name: 'Fruit Danish',
        tag: 'Seasonal',
        collection: 'pastries',
        price: 7.5,
        image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800',
        description: 'Buttery pastry cradling the best fruit of the season.',
        featured: false
    },
    {
        id: 'cinnamon-braid',
        name: 'Cinnamon Braid',
        tag: 'Warmth',
        collection: 'pastries',
        price: 6.0,
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800',
        description: 'Hand-braided with cinnamon sugar and a vanilla glaze.',
        featured: false
    },
    {
        id: 'artist-macarons',
        name: 'Artist Macarons',
        tag: 'Petit Fours',
        collection: 'pastries',
        price: 15.0,
        image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?q=80&w=800',
        description: 'A six-piece box in rotating seasonal flavours.',
        featured: false
    }
];

const OLATEAM_COLLECTIONS = {
    breads: 'breads.html',
    cakes: 'cakes.html',
    pastries: 'pastries.html'
};

window.OLATEAM_PRODUCTS = OLATEAM_PRODUCTS;
window.OLATEAM_COLLECTIONS = OLATEAM_COLLECTIONS;
