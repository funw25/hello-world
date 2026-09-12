#include<stdio.h>
#include<math.h>
int main()
{
	float x1,x2,x3,y1,y2,y3,a,b,c,A,L,p;
	scanf("%f %f %f %f %f %f",&x1,&y1,&x2,&y2,&x3,&y3);
	a=sqrt(pow((x1-x2),2)+pow((y1-y2),2)); 
	b=sqrt(pow((x2-x3),2)+pow((y2-y3),2)); 
	c=sqrt(pow((x1-x3),2)+pow((y1-y3),2)); 
	if(a+b>c&&a+c>b&&b+c>a)
	{
		L=a+b+c;
		p=L/2;
		A=sqrt(p*(p-a)*(p-b)*(p-c));
		printf("L=%.2f, A=%.2f",L,A);
	}
	else
	{
		printf("Impossible");
    }
	return 0;
} 
