import { COLLECTIONS } from '../../../constants';
import { GenericCollection } from '../../../views/GenericCollection';
import { notFound } from 'next/navigation';

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const collectionSchema = COLLECTIONS.find(c => c.id === resolvedParams.id);
  
  if (!collectionSchema) {
    notFound();
  }

  return <GenericCollection schema={collectionSchema} />;
}
