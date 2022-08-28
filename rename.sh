for i in ./preview/*/*/*.jpg;
do mv "$i" "${i%.jpg}";
done