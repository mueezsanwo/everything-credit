/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/shop/products/route.ts
import { NextResponse } from 'next/server';

// Mock products data
const PRODUCTS = [
  { id: 1, name: 'Samsung 43" Smart TV', price: 180000, image: '📺', category: 'tv', brand: 'Samsung', inStock: true },
  { id: 2, name: 'LG 8kg Washing Machine', price: 150000, image: '🧺', category: 'appliances', brand: 'LG', inStock: true },
  { id: 3, name: 'Hisense Double Door Fridge', price: 220000, image: '❄️', category: 'appliances', brand: 'Hisense', inStock: true },
  { id: 4, name: 'Binatone Microwave', price: 45000, image: '🔥', category: 'kitchen', brand: 'Binatone', inStock: true },
  { id: 5, name: 'Nexus Gas Cooker', price: 85000, image: '🍳', category: 'kitchen', brand: 'Nexus', inStock: true },
  { id: 6, name: 'Thermocool Generator', price: 180000, image: '⚡', category: 'electronics', brand: 'Thermocool', inStock: true },
  { id: 7, name: 'Sony Home Theater', price: 95000, image: '🔊', category: 'electronics', brand: 'Sony', inStock: true },
  { id: 8, name: 'LG 55" 4K Smart TV', price: 320000, image: '📺', category: 'tv', brand: 'LG', inStock: true }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let filteredProducts = PRODUCTS;
    
    if (category && category !== 'all') {
      filteredProducts = PRODUCTS.filter(p => p.category === category);
    }
    
    return NextResponse.json({ 
      success: true,
      products: filteredProducts
    });
    
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json({ 
      error: 'Failed to get products',
      details: error.message
    }, { status: 500 });
  }
}