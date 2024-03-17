export function truncateArray (array: any [], numberToDisplay: number) {	
	const newArray = array.length <= numberToDisplay 
		? array 
		: array.slice(- numberToDisplay);

	return newArray;
}