//编写定义一个结构体日期（年、月、日）
//计算并输出该日期是该年中的第几天，
//要求自定义函数，用结构体指针作为函数参数，
//并要考虑闰年和非闰年情况。
#include"stdio.h"
struct date
{
	int year;
	int month;
	int day;
};

int dayy(struct date*p)
{
	int days[]={0,31,28,31,30,31,30,31,31,30,31,30,31};
	
	int total=0;
	for(int i=1;i<p->month;i++){
		total+=days[i];
	}
	total+=p->day;
	if((p->year % 4 == 0 && p->year % 100!= 0) || p->year % 400 == 0)
	{
		total+=1;
	}
	return total;
}
int main(){
	struct date d;
	scanf("%d %d %d",&d.year,&d.month,&d.day);
	int t=dayy(&d);
	printf("%d",t);
	return 0;
}
