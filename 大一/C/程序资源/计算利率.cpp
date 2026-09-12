#include<stdio.h>
#include<math.h>//带次方的时候要加 
int main()
{
	int money,year;
	double rate,sum;
	scanf("%d %d %lf",&money,&year,&rate);
	sum=money*pow((1+rate),year);
	printf("%.2f",sum);
	return 0;
}
