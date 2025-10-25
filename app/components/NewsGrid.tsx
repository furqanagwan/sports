import React from 'react';
import { Newspaper } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsGridProps {
  articles: NewsArticle[];
}

export const NewsGrid: React.FC<NewsGridProps> = ({ articles }) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No news found for this team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => {
        const imageUrl =
          article.images?.[0]?.url ||
          'https://placehold.co/600x400/f1f5f9/94a3b8?text=News';
        const articleLink = article.links?.web?.href;

        return (
          <a
            key={article.id}
            href={articleLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl overflow-hidden block transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 hover:border-brand-blue-500"
          >
            <div className="relative overflow-hidden">
              <img
                src={imageUrl}
                alt={article.headline}
                className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://placehold.co/600x400/f1f5f9/94a3b8?text=News')
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-500 transition-colors">
                {article.headline}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {article.description || ''}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
};