import React, { useMemo, useState } from "react";
  import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useRouter } from "expo-router";
  import ConfirmModal from "@/components/modals/ConfirmModal";
  import SuccessModal from "@/components/modals/SuccessModal";
  import { MOCK_BIDS } from "../mockData";
  import type { BidStatus, InvestorBid } from "../types";
  import {
    BUSINESS_COLORS,
    formatCurrency,
    formatRelativeDate,
  } from "../utils";
  import BidItem from "./components/BidItem";
 
 type BidFilter = "all" | BidStatus;
 
 const FILTERS: { id: BidFilter; label: string }[] = [
   { id: "all", label: "All" },
   { id: "pending", label: "Pending" },
   { id: "accepted", label: "Accepted" },
   { id: "declined", label: "Declined" },
 ];
 
 export default function BusinessBidsScreen() {
   const router = useRouter();
   const [bids, setBids] = useState<InvestorBid[]>(MOCK_BIDS);
   const [filter, setFilter] = useState<BidFilter>("all");
   const [selectedBid, setSelectedBid] = useState<InvestorBid | null>(null);
   const [confirmAction, setConfirmAction] = useState<"accept" | "decline" | null>(
     null
   );
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
 
   const filteredBids = useMemo(() => {
     if (filter === "all") {
       return bids;
     }
 
     return bids.filter((bid) => bid.status === filter);
   }, [bids, filter]);
 
   const pendingCount = useMemo(
     () => bids.filter((bid) => bid.status === "pending").length,
     [bids]
   );
 
   const handleAcceptPress = (bid: InvestorBid) => {
     setSelectedBid(bid);
     setConfirmAction("accept");
   };
 
   const handleDeclinePress = (bid: InvestorBid) => {
     setSelectedBid(bid);
     setConfirmAction("decline");
   };
 
   const handleConfirm = () => {
     if (!selectedBid || !confirmAction) {
       return;
     }
 
     const nextStatus: BidStatus =
       confirmAction === "accept" ? "accepted" : "declined";
 
     setBids((current) =>
       current.map((bid) =>
         bid.id === selectedBid.id ? { ...bid, status: nextStatus } : bid
       )
     );
 
     setSuccessMessage(
       confirmAction === "accept"
         ? `You accepted ${selectedBid.investorName}'s bid of ${formatCurrency(selectedBid.amount)}.`
         : `You declined ${selectedBid.investorName}'s bid.`
     );
     setConfirmAction(null);
     setSelectedBid(null);
   };
 
   const handleCancelConfirm = () => {
     setConfirmAction(null);
     setSelectedBid(null);
   };
 
   return (
     <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
       <View style={styles.header}>
         <Text style={styles.title}>Investor Bids</Text>
         <Text style={styles.subtitle}>
           {pendingCount} pending review · {bids.length} total
         </Text>
       </View>
 
       <ScrollView
         horizontal
         showsHorizontalScrollIndicator={false}
         contentContainerStyle={styles.filterRow}
       >
         {FILTERS.map((item) => {
           const isActive = filter === item.id;
 
           return (
             <TouchableOpacity
               key={item.id}
               activeOpacity={0.85}
               onPress={() => setFilter(item.id)}
               style={[styles.filterChip, isActive && styles.filterChipActive]}
             >
               <Text
                 style={[styles.filterText, isActive && styles.filterTextActive]}
               >
                 {item.label}
               </Text>
             </TouchableOpacity>
           );
         })}
       </ScrollView>
 
       <ScrollView
         contentContainerStyle={styles.listContent}
         showsVerticalScrollIndicator={false}
       >
         {filteredBids.length === 0 ? (
           <View style={styles.emptyPanel}>
             <Text style={styles.emptyTitle}>No bids found</Text>
             <Text style={styles.emptyMessage}>
               {filter === "all"
                 ? "Post a pitch to start receiving investor offers."
                 : `No ${filter} bids at the moment.`}
             </Text>
             <TouchableOpacity
               activeOpacity={0.85}
               onPress={() => router.push("/(business)/post-pitch")}
               style={styles.emptyButton}
             >
               <Text style={styles.emptyButtonText}>Post a Pitch</Text>
             </TouchableOpacity>
           </View>
          ) : (
            filteredBids.map((bid) => (
              <BidItem
                key={bid.id}
                bid={bid}
                onAcceptPress={handleAcceptPress}
                onDeclinePress={handleDeclinePress}
              />
            ))
          )}
       </ScrollView>
 
       <ConfirmModal
         isVisible={confirmAction !== null}
         title={confirmAction === "accept" ? "Accept Bid" : "Decline Bid"}
         message={
           selectedBid
             ? confirmAction === "accept"
               ? `Accept ${selectedBid.investorName}'s bid of ${formatCurrency(selectedBid.amount)} for "${selectedBid.pitchTitle}"?`
               : `Decline ${selectedBid.investorName}'s bid of ${formatCurrency(selectedBid.amount)}?`
             : ""
         }
         confirmButtonText={confirmAction === "accept" ? "Accept" : "Decline"}
         confirmButtonColor={
           confirmAction === "accept" ? BUSINESS_COLORS.primary : "#EF4444"
         }
         onCancel={handleCancelConfirm}
         onConfirm={handleConfirm}
       />
 
       <SuccessModal
         isVisible={successMessage !== null}
         title={successMessage?.includes("accepted") ? "Bid Accepted" : "Bid Declined"}
         message={successMessage ?? ""}
         onClose={() => setSuccessMessage(null)}
       />
     </SafeAreaView>
   );
 }
 
 const styles = StyleSheet.create({
   safeArea: {
     flex: 1,
     backgroundColor: BUSINESS_COLORS.background,
   },
   header: {
     paddingHorizontal: 20,
     paddingTop: 8,
     paddingBottom: 16,
     gap: 4,
   },
   title: {
     color: BUSINESS_COLORS.text,
     fontSize: 28,
     fontWeight: "800",
   },
   subtitle: {
     color: BUSINESS_COLORS.muted,
     fontSize: 14,
   },
   filterRow: {
     paddingHorizontal: 20,
     gap: 8,
     paddingBottom: 16,
   },
   filterChip: {
     borderRadius: 999,
     paddingHorizontal: 16,
     paddingVertical: 8,
     backgroundColor: "#FFFFFF",
     borderWidth: 1,
     borderColor: "#E5E7EB",
   },
   filterChipActive: {
     backgroundColor: "#ECFDF5",
     borderColor: BUSINESS_COLORS.primary,
   },
   filterText: {
     color: BUSINESS_COLORS.muted,
     fontSize: 13,
     fontWeight: "600",
   },
   filterTextActive: {
     color: BUSINESS_COLORS.primaryDark,
   },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 12,
    },
    emptyPanel: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      gap: 10,
      marginTop: 8,
    },
   emptyTitle: {
     color: BUSINESS_COLORS.text,
     fontSize: 18,
     fontWeight: "800",
   },
   emptyMessage: {
     color: BUSINESS_COLORS.muted,
     fontSize: 14,
     lineHeight: 20,
     textAlign: "center",
   },
   emptyButton: {
     marginTop: 8,
     backgroundColor: "#ECFDF5",
     borderRadius: 999,
     paddingHorizontal: 16,
     paddingVertical: 10,
   },
   emptyButtonText: {
     color: BUSINESS_COLORS.primaryDark,
     fontSize: 13,
     fontWeight: "700",
   },
 });
 