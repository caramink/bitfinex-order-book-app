import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { socket } from '../sockets/socket';
import { throttle } from 'lodash';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install these dependencies
import { updateBook } from '../actions/order-book.action';
import commasForPrice from '../utils/utils';

const PRECESION = [0, 1, 2, 3, 4];

const OrderBook = connect((state) => ({
    book: state.orderbook,
}))(({ dispatch, book }) => {
    const { bids, asks } = book;

    const saveBook = useCallback(throttle((b) => dispatch(updateBook(b)), 500));

    const [precesion, setPrecision] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [connectionStatus, setConnectionStatus] = useState(true);

    const decPrecision = () => setPrecision((prevPrecision) => Math.max(prevPrecision - 1, 0));
    const incPrecision = () => setPrecision((prevPrecision) => Math.min(prevPrecision + 1, PRECESION.length - 1));
    const decScale = () => setScale(scale + 0.1);
    const incScale = () => setScale(scale - 0.1);

    const startConnection = () => !connectionStatus && setConnectionStatus(true);
    const stopConnection = () => connectionStatus && setConnectionStatus(false);

    const prec = precesion % PRECESION.length;

    useEffect(() => {
        socket({ book, saveBook, precesion, setConnectionStatus, connectionStatus });
    }, [connectionStatus]);

    const _asks = asks && Object.keys(asks).slice(0, 21).reduce((acc, k, i) => {
        const total = Object.keys(asks).slice(0, i + 1).reduce((t, i) => {
            t = t + asks[i].amount;
            return t;
        }, 0);
        const item = asks[k];
        acc[k] = { ...item, total };
        return acc;
    }, {});

    const maxAsksTotal = Object.keys(_asks).reduce((t, i) => {
        if (t < _asks[i].total) {
            return _asks[i].total;
        } else {
            return t;
        }
    }, 0);

    const _bids = bids && Object.keys(bids).slice(0, 21).reduce((acc, k, i) => {
        const total = Object.keys(bids).slice(0, i + 1).reduce((t, i) => {
            t = t + bids[i].amount;
            return t;
        }, 0);
        const item = bids[k];
        acc[k] = { ...item, total };
        return acc;
    }, {});

    const maxBidsTotal = Object.keys(_bids).reduce((t, i) => {
        if (t < _bids[i].total) {
            return _bids[i].total;
        } else {
            return t;
        }
    }, 0);

    return (
        <View>
            <View style={styles.panel}>
                <View style={styles.bar}>
                    <Text style={styles.orderBookText}>Order Book <Text style={styles.currencyPairText}>BTC/USD</Text></Text>
                    <View style={styles.tools}>
                        {!connectionStatus && <TouchableOpacity onPress={startConnection}><Text style={styles.iconText}>Connect</Text></TouchableOpacity>}
                        {connectionStatus && <TouchableOpacity onPress={stopConnection}><Text style={styles.iconText}>Disconnect</Text></TouchableOpacity>}
                        <TouchableOpacity onPress={incPrecision}><Text style={styles.iconText}>.0</Text></TouchableOpacity>
                        <TouchableOpacity onPress={decPrecision}><Text style={styles.iconText}>.00</Text></TouchableOpacity>
                        <TouchableOpacity onPress={decScale}><MaterialIcons name="zoom-out" size={20} color="white" /></TouchableOpacity>
                        <TouchableOpacity onPress={incScale}><MaterialIcons name="zoom-in" size={20} color="white" /></TouchableOpacity>
                    </View>
                </View>
                <View style={styles.sides}>
                    <View style={styles.side}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.countHeader}>COUNT</Text>
                            <Text style={styles.countHeader}>AMOUNT</Text>
                            <Text style={styles.totalHeader}>TOTAL</Text>
                            <Text style={styles.countHeader}>PRICE</Text>
                        </View>
                        {_bids &&
                            Object.keys(_bids).map((k, i) => {
                                const item = _bids[k];
                                const { cnt, amount, price, total } = item;
                                const percentage = ((total * 100) / (maxBidsTotal * scale));
                                return (
                                    <View
                                        key={`book-${cnt}${amount}${price}${total}`}
                                        style={{
                                            ...styles.row,
                                            color: "white",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                            backgroundImage: `linear-gradient(to left, #314432 ${percentage}%, #1b262d 0%)`,
                                        }}>
                                        <Text style={styles.countText}>{cnt}</Text>
                                        <Text style={styles.countText}>{amount.toFixed(2)}</Text>
                                        <Text style={styles.countText}>{total.toFixed(2)}</Text>
                                        <Text style={styles.countText}>{commasForPrice(price.toFixed(prec))}</Text>
                                    </View>
                                );
                            })}
                    </View>
                    <View style={styles.side}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.totalHeader}>PRICE</Text>
                            <Text style={styles.totalHeader}>TOTAL</Text>
                            <Text style={styles.totalHeader}>AMOUNT</Text>
                            <Text style={styles.countHeader}>COUNT</Text>
                        </View>
                        {_asks &&
                            Object.keys(_asks).map((k, i) => {
                                const item = _asks[k];
                                const { cnt, amount, price, total } = item;
                                const percentage = (total * 100) / (maxAsksTotal * scale);
                                return (
                                    <View
                                        key={`book-${cnt}${amount}${price}${total}`}
                                        style={{
                                            ...styles.row,
                                            color: "white",
                                            flexDirection: "row",
                                            justifyContent: "space-around",
                                            backgroundImage: `linear-gradient(to right, #402c33 ${percentage}%, #1b262d 0%)`,
                                        }}>
                                        <Text style={styles.countText}>{commasForPrice(price.toFixed(prec))}</Text>
                                        <Text style={styles.countText}>{total.toFixed(2)}</Text>
                                        <Text style={styles.countText}>{amount.toFixed(2)}</Text>
                                        <Text style={styles.countText}>{cnt}</Text>
                                    </View>
                                );
                            })}
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#1b262d',
        flexGrow: 0,
        flexDirection: 'column',
        width: 645,
        margin: 5,
        padding: 5,
        boxSizing: 'border-box',
    },
    sides: {
        flexDirection: 'row',
        flexBasis: '100%',
    },
    side: {
        borderSpacing: 0,
        flexBasis: '50%',
        width: 'calc(50% - 2px)',
        margin: '0px 1px',
    },
    row: {
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        display: 'flex',
        flexDirection: "row !important",
        padding: 0,
    },
    countText: {
        textAlign: 'right',
        color: "white"
    },
    countHeader: {
        textAlign: 'center',
        fontSize: 12,
        color: 'gray',
    },
    totalHeader: {
        fontSize: 12,
        color: 'gray',
    },
    totalText: {
        textAlign: 'right',
    },
    bar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#555',
        height: 30,
        paddingBottom: 5,
        marginBottom: 10,
    },
    orderBookText: {
        padding: 10,
        margin: 0,
        fontSize: 16,
        color: 'white',
    },
    currencyPairText: {
        color: '#888',
        fontSize: 16,
    },
    tools: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: "center",
        gap: "8px"
    },
    iconText: {
        padding: 10,
        fontSize: 15,
        color: 'white',
    },
    tableHeader: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: "space-around",
        width: "100%"
    },
});

export default OrderBook;