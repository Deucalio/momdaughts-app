import { Image } from 'expo-image';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "../components/Text";
const { width } = Dimensions.get("window");

// Enhanced Image Gallery Component
const ImageGallery = ({
  images,
  currentIndex,
  onImageChange,
  onImagePress,
}) => {
  const handleImageTap = () => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onImageChange(nextIndex);
    if (onImagePress) onImagePress();
  };

  return (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={handleImageTap} style={styles.imageWrapper}>
        <Image
          source={{ uri: images[currentIndex] }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Image Indicators */}
      {images.length > 1 && (
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
              onPress={() => onImageChange(index)}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

// Enhanced Product Card Component
const ProductCard = ({
  product,
  selectedVariant,
  selectedOptions,
  quantity,
  currentImageIndex,
  onImageChange,
  onOptionSelect,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  getAllImages,
  getRating,
  getReviewCount,
  getPrice,
  getCompareAtPrice,
  isVariantAvailable,
}) => {
  const compareAtPrice = getCompareAtPrice();
  const allImages = getAllImages();

  return (
    <View style={styles.productCard}>
      {/* Enhanced Product Image Gallery */}
      <ImageGallery
        images={allImages}
        currentIndex={currentImageIndex}
        onImageChange={onImageChange}
      />

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productSubtitle}>
          {selectedVariant?.displayName || "Premium Quality Product"}
        </Text>

        {/* Variant Badge */}
        {selectedVariant && (
          <View style={styles.variantBadge}>
            <Text style={styles.variantBadgeText}>{selectedVariant.title}</Text>
          </View>
        )}

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <StarRating rating={getRating()} size={14} showRating />
          <Text style={styles.reviewCount}>({getReviewCount()} reviews)</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>Rs. {getPrice()}</Text>
          {compareAtPrice && (
            <Text style={styles.compareAtPrice}>Rs. {compareAtPrice}</Text>
          )}
        </View>

        {/* Availability Status */}
        <View style={styles.availabilityContainer}>
          {!isVariantAvailable() ? (
            <Text style={styles.unavailableText}>⚠️ Out of Stock</Text>
          ) : (
            <Text style={styles.availableText}>✅ In Stock</Text>
          )}

          {/* Inventory Count */}
          {selectedVariant?.inventoryQuantity !== undefined &&
            isVariantAvailable() && (
              <Text style={styles.inventoryText}>
                {selectedVariant.inventoryQuantity} available
              </Text>
            )}
        </View>

        {/* Options */}
        {product.options &&
          product.options.map((option, index) => (
            <OptionSelector
              key={option.id || index}
              title={option.name}
              options={option.values}
              selectedOption={selectedOptions[option.name]}
              onSelect={(value) => onOptionSelect(option.name, value)}
            />
          ))}

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => onQuantityChange(Math.max(1, quantity - 1))}
            onIncrease={() => onQuantityChange(quantity + 1)}
            disabled={!isVariantAvailable()}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Buy Now Button */}
          <TouchableOpacity
            style={[
              styles.buyButton,
              !isVariantAvailable() && styles.disabledButton,
            ]}
            onPress={onBuyNow}
            disabled={!isVariantAvailable()}
          >
            <Text style={styles.buyButtonText}>
              {isVariantAvailable() ? "Buy Now" : "Out of Stock"}
            </Text>
          </TouchableOpacity>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !isVariantAvailable() && styles.disabledButton,
            ]}
            onPress={onAddToCart}
            disabled={!isVariantAvailable()}
          >
            <Text
              style={[
                styles.addToCartButtonText,
                !isVariantAvailable() && styles.disabledButtonText,
              ]}
            >
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Description */}
        {product.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {/* Variant Info */}
        {selectedVariant?.sku && (
          <View style={styles.variantInfo}>
            <Text style={styles.variantInfoText}>
              SKU: {selectedVariant.sku}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Supporting Components (you already have these, but here are enhanced versions)
const StarRating = ({ rating, size = 16, showRating = false }) => {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: size, color: i < rating ? "#FFD700" : "#E5E7EB" },
          ]}
        >
          ★
        </Text>
      ))}
      {showRating && <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>}
    </View>
  );
};

const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
}) => (
  <View style={[styles.quantityContainer, disabled && styles.disabledQuantity]}>
    <TouchableOpacity
      onPress={onDecrease}
      style={[styles.quantityButton, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <Text
        style={[
          styles.quantityButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        −
      </Text>
    </TouchableOpacity>
    <View style={styles.quantityDisplay}>
      <Text style={[styles.quantityText, disabled && styles.disabledText]}>
        {quantity}
      </Text>
    </View>
    <TouchableOpacity
      onPress={onIncrease}
      style={[styles.quantityButton, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <Text
        style={[
          styles.quantityButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        +
      </Text>
    </TouchableOpacity>
  </View>
);

const OptionSelector = ({ title, options, selectedOption, onSelect }) => (
  <View style={styles.optionContainer}>
    <Text style={styles.optionTitle}>{title}</Text>
    <View style={styles.optionButtons}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOption === option && styles.optionButtonSelected,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedOption === option && styles.optionButtonTextSelected,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    height: 350,
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#2c2a6b",
    width: 20,
  },
  imageCounter: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
  },
  productInfo: {
    padding: 24,
  },
  productTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  variantBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  variantBadgeText: {
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
    color: "#2c2a6b",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: "#1F2937",
  },
  reviewCount: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontFamily: "Outfit-Bold",
    color: "#1F2937",
  },
  compareAtPrice: {
    fontSize: 18,
    color: "#6B7280",
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  unavailableText: {
    fontSize: 16,
    color: "#EF4444",
    fontFamily: "Outfit-SemiBold",
  },
  availableText: {
    fontSize: 16,
    color: "#059669",
    fontFamily: "Outfit-SemiBold",
  },
  inventoryText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#1F2937",
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#2c2a6b",
    borderColor: "#2c2a6b",
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: "#6B7280",
  },
  optionButtonTextSelected: {
    color: "#ffffff",
    fontFamily: "Outfit-SemiBold",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#1F2937",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    padding: 4,
  },
  disabledQuantity: {
    opacity: 0.5,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Outfit-Bold",
  },
  quantityDisplay: {
    paddingHorizontal: 20,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#1F2937",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  buyButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2c2a6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Outfit-Bold",
  },
  addToCartButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2c2a6b",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "#2c2a6b",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    borderColor: "#9CA3AF",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 20,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  variantInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  variantInfoText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

export {
  ImageGallery, OptionSelector, ProductCard, QuantitySelector, StarRating
};

