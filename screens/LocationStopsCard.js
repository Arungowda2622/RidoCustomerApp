// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const LocationStopsCard = ({
//   stops,
//   onAddStop,
//   onRemoveStop,
// }) => {
//   const renderIcon = (index) => {
//     if (index === 0) {
//       return <Ionicons name="radio-button-on" size={18} color="green" />;
//     } else if (index === stops.length - 1) {
//       return <Ionicons name="location" size={20} color="green" />;
//     } else {
//       return <Ionicons name="radio-button-on" size={14} color="#999" />;
//     }
//   };

//   return (
//     <View style={styles.card}>
     
//        {stops.map((stop, index) => (
//   <View key={index} style={styles.stopRow}>
//     <View style={styles.iconWrapper}>
//       <Ionicons
//         name={
//           index === 0
//             ? 'radio-button-on'
//             : index === stops.length - 1
//             ? 'location-sharp'
//             : 'ellipse-outline'
//         }
//         size={20}
//         color={index === 0 ? 'green' : index === stops.length - 1 ? 'red' : 'gray'}
//       />
//       {index !== stops.length - 1 && <View style={styles.dash} />}
//     </View>

//     <View style={styles.labelWrapper}>
//       {stop.editable ? (
//         <TextInput
//           style={styles.labelInput}
//           placeholder="Enter stop location"
//           value={stop.label}
//           onChangeText={(text) => {
//             const newStops = [...stops];
//             newStops[index].label = text;
//             onChangeStops?.(newStops); // Optional: lift to parent
//             setStops(newStops); // If managing locally
//           }}
//         />
//       ) : (
//         <Text style={styles.labelText}>{stop.label}</Text>
//       )}
//     </View>

//     {stop.canRemove && (
//       <TouchableOpacity onPress={() => onRemoveStop(index)}>
//         <Ionicons name="close-circle" size={20} color="gray" />
//       </TouchableOpacity>
//     )}
//   </View>
// ))}


//       <TouchableOpacity style={styles.addStop} onPress={onAddStop}>
//         <Ionicons name="add" size={16} color="#000" />
//         <Text style={styles.addStopText}>Add Stop</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default LocationStopsCard;

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginVertical: 16,
//     elevation: 2,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   iconColumn: {
//     width: 24,
//     alignItems: 'center',
//   },
//   dashedLine: {
//     width: 1,
//     flex: 1,
//     backgroundColor: '#ccc',
//     borderStyle: 'dashed',
//     marginVertical: 2,
//   },
//   locationInput: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   locationText: {
//     color: '#555',
//     fontSize: 14,
//   },
//   addStop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderColor: '#eee',
//     marginTop: 8,
//   },
//   addStopText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '500',
//   },
//   labelInput: {
//   borderBottomWidth: 1,
//   borderBottomColor: '#ccc',
//   paddingVertical: 4,
//   fontSize: 14,
//   width: '100%',
// },
// });

import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LocationStopsCard = ({ stops, setStops, onAddStop, onRemoveStop }) => {

    

  return (
    <View style={styles.card}>
      {stops.map((stop, index) => {
        const isPickup = index === 0;
        const isDropoff = index === stops.length - 1;
        const isMidStop = !isPickup && !isDropoff;

        return (
          <View key={index} style={styles.stopRow}>
            {/* Icon + dashed line */}
            <View style={styles.iconColumn}>
              {/* Icon */}
              {isPickup ? (
                <Ionicons name="radio-button-on" size={18} color="green" />
              ) : isDropoff ? (
                <Ionicons name="location-sharp" size={20} color="green" />
              ) : (
                <Ionicons name="ellipse-outline" size={16} color="gray" />
              )}
              {/* Dashed Line */}
              {index !== stops.length - 1 && (
                <View style={styles.dashedLine} />
              )}
            </View>

            {/* Input/Label */}
            <View style={styles.inputContainer}>
              {stop.editable ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter stop location"
                  value={stop.label}
                  onChangeText={(text) => {
                    const updated = [...stops];
                    updated[index].label = text;
                    setStops(updated);
                  }}
                />
              ) : (
                <Text style={styles.labelText} numberOfLines={2} ellipsizeMode="tail">{stop.label}</Text>
              )}
            </View>

            {/* Right actions */}
            <View style={styles.rightAction}>
              {isPickup ? (
                <TouchableOpacity>
                  
                  <Ionicons name="chevron-down" size={16} />
                </TouchableOpacity>
              ) : stop.canRemove ? (
                <TouchableOpacity onPress={() => onRemoveStop(index)}>
                  <Ionicons name="close" size={20} color="gray" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        );
      })}

      {/* Add Stop */}
      {stops.length < 5 && (
        <TouchableOpacity style={styles.addStop} onPress={onAddStop}>
          <Ionicons name="add" size={20} color="black" />
          <Text style={{ marginLeft: 6 }}>Add Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LocationStopsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginVertical: 10,
    borderColor:'#C3C3C3',
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  dashedLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
  },
  inputContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 6,
  },
  input: {
    fontSize: 14,
    paddingVertical: 2,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  labelText: {
    fontSize: 14,
    color: '#444',
    paddingTop: 2,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  nowText: {
    fontWeight: '500',
    fontSize: 12,
  },
  addStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
});
