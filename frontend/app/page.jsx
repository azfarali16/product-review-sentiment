"use client";
import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, Calendar, MessageCircle, ThumbsUp, ThumbsDown,MessageSquare, BarChart3, Loader2, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// API utility function
async function fetchScrapeData(payload) {
  console.log(payload);
  try {
    const response = await fetch('http://localhost:8000/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch error: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from backend:', error);
    throw error;
  }
}

// Search Page Component
const SearchPage = ({ onSearch, loading, error }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchQuery.includes('daraz.pk') || searchQuery.includes('http')) {
        onSearch(searchQuery);
      } else {
        // For demo purposes, you could show an error or try to search by product name
        alert('Please enter a valid Daraz product URL');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-black mb-4">
              Product Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Analyze product reviews, ratings, and sentiment with advanced AI-powered insights
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Daraz product URL (e.g., https://www.daraz.pk/products/...)"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-black"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !searchQuery.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Product...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Product
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          {/* Demo Button */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Don't have a URL? Try our demo product:</p>
            <button
              onClick={() => onSearch('https://www.daraz.pk/products/p9-i490630099.html')}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Load Demo Product
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Advanced Analytics</h3>
              <p className="text-gray-600">Get detailed insights into product performance and customer sentiment</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Review Analysis</h3>
              <p className="text-gray-600">AI-powered sentiment analysis of customer reviews and feedback</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Trend Tracking</h3>
              <p className="text-gray-600">Monitor rating trends and review patterns over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Details Page Component
const ProductDetailsPage = ({ productData, onBack, loading }) => {
  const [animateStats, setAnimateStats] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (productData) {
      setAnimateStats(true);
    }
  }, [productData]);

  const formatDate = (dateString) => {
    if (!isClient) return dateString;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getChartData = () => {
    if (!productData) return { ratingsChartData: [], sentimentChartData: [], timeChartData: [] };

    const ratingsChartData = Object.entries(productData.review_stats.ratings_distribution).map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
      percentage: ((count / productData.review_stats.total_reviews) * 100).toFixed(1)
    }));

    const sentimentChartData = Object.entries(productData.review_stats.sentiment_distribution).map(([sentiment, count]) => ({
      name: sentiment,
      value: count,
      percentage: ((count / productData.review_stats.total_reviews) * 100).toFixed(1)
    }));

    const timeChartData = Object.entries(productData.time_analysis.reviews_over_time)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        month: date,
        reviews: count
      }));

    return { ratingsChartData, sentimentChartData, timeChartData };
  };

  const { ratingsChartData, sentimentChartData, timeChartData } = getChartData();

  const COLORS = {
    Positive: '#10B981',
    Negative: '#EF4444',
    Neutral: '#F59E0B'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </button>
            <h1 className="text-2xl font-bold text-black">Product Analytics</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <img
                src={productData.product.image_url}
                alt={productData.product.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA2LjYyNyA3MCAxMTIgNzUuMzczIDExMiA4MkMxMTIgODguNjI3IDEwNi42MjcgOTQgMTAwIDk0Qzk3LjM2NjMgOTQgOTQuOTczOSA5Mi44OTM1IDkzLjI5NzEgOTEuMTE1MkM5MS42MjAzIDg5LjMzNjkgOTAuNzUgODYuOTU2NSA5MC43NSA4NC41Qzg5LjIzNTcgODQuNSA4OCA4My4yNjQzIDg4IDgxLjc1Qzg4IDgwLjIzNTcgODkuMjM1NyA3OSA5MC43NSA3OUM5MS4wNDQ2IDc3LjUzNTcgOTEuNTUzNiA3Ni4xMzIxIDkyLjIzNTcgNzQuODc1Qzg5LjQ2MzEgNzMuNjAwOSA4Ny40MjQxIDcxLjU0MSA4NiA2OC44NjM4Qzg0LjU3NTkgNjYuMTg2NiA4NCA2My4xNDE2IDg0IDU5LjhDODQgNTMuNzQ5MyA4Ni4zNzEgNDguMDQ0MyA5MC41MzUgNDMuODA3MUM5NC42OTkgMzkuNTY5OSAxMDAuMzEgMzcuMiAxMDYuMjUgMzcuMkMxMTIuMTkgMzcuMiAxMTcuODAxIDM5LjU2OTkgMTIxLjk2NSA0My44MDcxQzEyNi4xMjkgNDguMDQ0MyAxMjguNSA1My43NDkzIDEyOC41IDU5LjhDMTI4LjUgNjMuMTQxNiAxMjcuOTI0IDY2LjE4NjYgMTI2LjUgNjguODYzOEMxMjUuMDc2IDcxLjU0MSAxMjMuMDM3IDczLjYwMDkgMTIwLjI2NCA3NC44NzVDMTIwLjk0NiA3Ni4xMzIxIDEyMS40NTUgNzcuNTM1NyAxMjEuNzUgNzlDMTIzLjI2NCA3OSAxMjQuNSA4MC4yMzU3IDEyNC41IDgxLjc1QzEyNC41IDgzLjI2NDMgMTIzLjI2NCA4NC41IDEyMS43NSA4NC41QzEyMS43NSA4Ni45NTY1IDEyMC44OCA4OS4zMzY5IDExOS4yMDMgOTEuMTE1MkMxMTcuNTI2IDkyLjg5MzUgMTE1LjEzNCA5NCAxMTIuNSA5NEMxMDkuMzczIDk0IDEwNC41IDg4LjYyNyAxMDQgODJDMTA0IDc1LjM3MyAxMDYuNjI3IDcwIDEwMCA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                }}
              />
            </div>
            <div className="lg:w-2/3">
              <h1 className="text-2xl font-bold text-black mb-4">{productData.product.name}</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{productData.product.ratings_count}</div>
                  <div className="text-sm text-gray-500">Total Ratings</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-black">{productData.review_stats.average_rating}</span>
                  </div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{productData.review_stats.total_reviews}</div>
                  <div className="text-sm text-gray-500">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((productData.review_stats.sentiment_distribution.Positive / productData.review_stats.total_reviews) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">Positive Reviews</div>
                </div>
              </div>
              {productData.product.url && (
                <a
                  href={productData.product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Daraz
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Ratings Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
              <Star className="w-5 h-5 text-yellow-400" />
              Ratings Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'Reviews']} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Sentiment Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, `${name} Reviews`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {sentimentChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[entry.name] }}
                  ></div>
                  <span className="text-sm text-black">{entry.name} ({entry.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
            <Calendar className="w-5 h-5 text-green-500" />
            Reviews Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="reviews"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Key Insights
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {Object.entries(productData.review_stats.ratings_distribution)
                  .sort(([,a], [,b]) => b - a)[0][0]}⭐
              </div>
              <div className="text-sm text-gray-600">Most Common Rating</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Object.entries(productData.time_analysis.reviews_over_time)
                  .sort(([,a], [,b]) => b - a)[0][0]}
              </div>
              <div className="text-sm text-gray-600">Peak Review Month</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {productData.time_analysis.last_review_date}
              </div>
              <div className="text-sm text-gray-600">Last Review</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {((productData.review_stats.sentiment_distribution.Positive / productData.review_stats.total_reviews) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Positive Sentiment</div>
            </div>
          </div>
        </div>

        {/* Sample Reviews */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Positive Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              Top Positive Reviews
            </h3>
            <div className="space-y-4">
              {productData.samples.top_positive_reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{review.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Negative Reviews */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
              <ThumbsDown className="w-5 h-5 text-red-500" />
              Top Negative Reviews
            </h3>
            <div className="space-y-4">
              {productData.samples.top_negative_reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{review.content}</p>
                </div>
              ))}
            </div>
          </div>

         {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {productData.samples.recent_reviews.slice(0, 5).map((review, index) => {
              // Determine border color based on sentiment
              const getBorderColor = (sentiment) => {
                switch (sentiment) {
                  case "Positive":
                    return "border-green-500";
                  case "Negative":
                    return "border-red-500";
                  case "Neutral":
                    return "border-gray-500";
                  default:
                    return "border-gray-500"; // fallback
                }
              };

              return (
                <div key={index} className={`border-l-4 ${getBorderColor(review.sentiment)} pl-4 py-2`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{review.content}</p>
                </div>
              );
            })}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

// Main App Component
const ProductDashboard = () => {
  const [currentPage, setCurrentPage] = useState('search'); // 'search' or 'details'
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductData = async (productUrl) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        product_link: productUrl || 'https://www.daraz.pk/products/p9-i490630099.html',
        review_count: 50
      };

      const data = await fetchScrapeData(payload);
      setProductData(data);
      setCurrentPage('details');
    } catch (err) {
      setError(err.message || 'Failed to load product data. Please try again.');
      console.error('Error fetching product data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentPage('search');
    setProductData(null);
    setError(null);
  };

  return (
    <div>
      {currentPage === 'search' ? (
        <SearchPage
          onSearch={fetchProductData}
          loading={loading}
          error={error}
        />
      ) : (
        <ProductDetailsPage
          productData={productData}
          onBack={handleBackToSearch}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProductDashboard;