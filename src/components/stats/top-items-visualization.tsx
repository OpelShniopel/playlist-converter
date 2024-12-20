import { useState } from "react";

interface TopItem {
  id: string;
  name: string;
  image: string;
  subtitle: string;
  popularity: number;
}

interface TopItemsVisualizationProps {
  title: string;
  items: TopItem[];
  loading?: boolean;
}

export function TopItemsVisualization({
  title,
  items,
  loading = false,
}: Readonly<TopItemsVisualizationProps>) {
  const [visibleCount, setVisibleCount] = useState(10);

  const getPopularityColor = (popularity: number): string => {
    if (popularity >= 70) return "bg-emerald-500"; // Mainstream
    if (popularity >= 30) return "bg-blue-500"; // Mixed
    return "bg-violet-500"; // Underground
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={`skeleton-${title.toLowerCase()}-${i}`}
              className="flex items-center space-x-4 p-4 bg-card rounded-lg animate-pulse"
            >
              <div className="w-12 h-12 bg-muted rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="space-y-2">
        {items.slice(0, visibleCount).map((item, index) => (
          <div
            key={item.id}
            className="group flex items-center space-x-4 p-4 bg-card hover:bg-card/80 rounded-lg transition-colors"
          >
            {/* Rank */}
            <div className="w-6 text-xl font-bold text-muted-foreground group-hover:text-foreground">
              {index + 1}
            </div>

            {/* Image */}
            <div className="w-12 h-12 rounded-md overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {item.subtitle}
              </p>
            </div>

            {/* Updated Popularity Bar */}
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getPopularityColor(item.popularity)}`}
                  style={{ width: `${item.popularity}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">
                {item.popularity}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {items.length > visibleCount && (
        <button
          onClick={() =>
            setVisibleCount((prev) => Math.min(prev + 10, items.length))
          }
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show More
        </button>
      )}
    </div>
  );
}
