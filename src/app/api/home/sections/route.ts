import { NextResponse } from 'next/server';
import { homepageConfig } from '@/features/guest/discovery/home/config/sections';
import { getSectionListings } from '@/features/guest/discovery/home/api/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('id');

  if (!sectionId) {
    return NextResponse.json({ error: 'Missing section id' }, { status: 400 });
  }

  const config = homepageConfig.find((c) => c.id === sectionId);
  if (!config) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  try {
    const listings = await getSectionListings(config);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error(`Failed to load section ${sectionId}:`, error);
    return NextResponse.json({ listings: [] }, { status: 500 });
  }
}
