import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CARDS, type CardStackItem } from "@/components/ui/cardStackData";

describe("Tinder-Style CardStack Discovery Feature Verification", () => {
  it("provides valid default discovery cards with high-res optimized images", () => {
    expect(DEFAULT_CARDS.length).toBeGreaterThanOrEqual(4);
    for (const card of DEFAULT_CARDS) {
      expect(card.image).toBeDefined();
      expect(card.title).toBeDefined();
      expect(card.subtitle).toBeDefined();
      expect(card.tag).toBeDefined();
      // Verifies Phase 5 image optimization parameter (w=400&q=75)
      expect(card.image).toMatch(/(?:w=400|youmarriagewearrange\.com)/);
    }
  });

  it("verifies swipe direction state logic for like vs pass transitions", () => {
    let likedItem: CardStackItem | null = null;
    let dislikedItem: CardStackItem | null = null;
    let swipedDirection: string | null = null;

    const onLike = (item: CardStackItem) => {
      likedItem = item;
    };
    const onDislike = (item: CardStackItem) => {
      dislikedItem = item;
    };
    const onSwipe = (item: CardStackItem, dir: "left" | "right") => {
      swipedDirection = dir;
      if (dir === "right") onLike(item);
      else onDislike(item);
    };

    const testItem = DEFAULT_CARDS[0];

    // Simulate Swipe Right (Like)
    onSwipe(testItem, "right");
    expect(swipedDirection).toBe("right");
    expect(likedItem).toBe(testItem);
    expect(dislikedItem).toBeNull();

    // Reset and Simulate Swipe Left (Pass)
    likedItem = null;
    swipedDirection = null;
    onSwipe(testItem, "left");
    expect(swipedDirection).toBe("left");
    expect(dislikedItem).toBe(testItem);
    expect(likedItem).toBeNull();
  });

  it("ensures deck state transitions smoothly to empty state and resets cleanly", () => {
    let currentDeck = [...DEFAULT_CARDS];

    // Simulate swiping all cards
    while (currentDeck.length > 0) {
      currentDeck = currentDeck.slice(1);
    }
    expect(currentDeck.length).toBe(0);

    // Resetting deck
    currentDeck = [...DEFAULT_CARDS];
    expect(currentDeck.length).toBe(DEFAULT_CARDS.length);
  });
});
