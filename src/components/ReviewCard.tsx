import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { IBeachReview } from '../types/beach.d'; // Ajuste o caminho

interface TouristReviewCardProps {
    review: IBeachReview;
}

const PRIMARY_COLOR = '#1976d2';

// Função auxiliar para renderizar estrelas
const renderStars = (rating: number | null) => {
    if (!rating) return <Text style={styles.noRatingText}>S/N</Text>;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Icon
                key={i}
                name={i <= rating ? 'star' : 'star-outline'}
                size={16}
                color={i <= rating ? '#FFC107' : '#BDBDBD'}
                style={{ marginRight: 2 }}
            />
        );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
};

export default function TouristReviewCard({ review }: TouristReviewCardProps) {
    const userName = review.user?.name || 'Turista Anônimo';
    const formattedDate = format(new Date(review.created_at), 'dd/MM/yyyy');

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>

            <View style={styles.ratingRow}>
                {renderStars(review.rating)}
                {review.rating !== null && (
                    <Text style={styles.ratingValue}>{review.rating.toFixed(1)} / 5</Text>
                )}
            </View>

            <Text style={styles.commentText}>"{review.comment_text}"</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: PRIMARY_COLOR,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: PRIMARY_COLOR,
        marginLeft: 8,
    },
    noRatingText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    commentText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        fontStyle: 'italic',
    }
});