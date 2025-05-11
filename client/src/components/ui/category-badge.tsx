interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const getColorsByCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sports':
        return 'bg-amber-500 text-white';
      case 'cultural':
        return 'bg-primary text-white';
      case 'education':
        return 'bg-purple-500 text-white';
      case 'fundraising':
        return 'bg-secondary text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span 
      className={`text-xs uppercase tracking-wide font-bold px-2 py-1 rounded-full ${getColorsByCategory(category)}`}
    >
      {category}
    </span>
  );
}
