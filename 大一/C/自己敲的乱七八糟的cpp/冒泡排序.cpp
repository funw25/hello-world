//冒泡排序

#include<stdio.h>
void sort(int* pArr,int len)
{
	
	
 } 
int main(void)
{
	int a[6]={10,2,8,-8,11,0};
	int i=0;
	
	sort(a,6);
	
	for(i=0;i<6;++i)
	{
		
		printf("%d",a[i]);
	}
	printf("\n");
	return 0;
}
 
先排个升序
排完之后，最后一个是最大的  
六个数字找到最大值，要比五次
 
#include<stdio.h>
void sort(int* pArr,int len)
{
	int i,j,t;
	for(i=0;i<len-1;++i)
	{
		for(j=0;j<len-1-i;++j)
		//一轮内层循环都会将当前未排序部分的最大（或最小）元素
		//移动到其正确位置（就像气泡上浮到水面一样）。


		{
             if(a[j]>a[j+1])
             {
             	t=a[j];
             	a[j]=a[j+1];//
             	a[j+1]=t;
             	
             	
			 }
		}
	}
	
 } 
int main(void)
{
	int a[6]={10,2,8,-8,11,0};
	int i=0;
	
	sort(a,6);
	
	for(i=0;i<6;++i)
	{
		
		printf("%d",a[i]);
	}
	printf("\n");
	return 0;
}
