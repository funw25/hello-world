#include<stdio.h>
int main()
{
	double r,circumference,area,PI;
	scanf("%lf",&r);
	PI=3.14;
	circumference=2.00*PI*r;
	area=PI*r*r;
	printf("circumference=%.2f,area=%.2f",circumference,area);
	return 0;
}
